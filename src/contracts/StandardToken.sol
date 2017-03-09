pragma solidity ^0.4.0;


import "./ExchangeToken.sol";
import "./TokenData.sol";
import "./User.sol";


// at startup display vesion and price from ozcoin account
// include blocknumbers in events
// generate tokens function - have initialise to activate contract, set admin address, ozcoin address, and generate tokens
// check all payments got to accounts rather than contracts


contract StandardToken is ExchangeToken {

    struct Price {
    uint256 buy;
    uint256 sell;
    }

    struct EtherShare {
    uint256 ozcoinShare;
    address affiliate;
    uint256 affiliateShare;
    address company;
    uint256 companyShare;

    }

    uint8 affiliatePercent;

    User userContract;

    mapping (address => uint256) etherBalances;

    mapping (address => Price) prices;
// true = frozen
    mapping (address => bool) accountFrozen;

    event AffilliatePercentageChanged(uint8 oldRate, uint8 newRate);

    event OzCoinPaid(address indexed _sender, uint256 _amount);

    event AffiliatePaid(address indexed _sender, address _affiliate, uint256 _amount);

    event InsufficientFunds(address indexed _account, uint256 _offered, uint256 _required);

    event FailedToSend(address recipient, uint256 amount);

    event AccountFrozen(address indexed _account);

    event AccountUnFrozen(address indexed _account);

    event ArbitrationRequested(address indexed _account, bytes32 ID);

    event PriceSet(address indexed seller, bool side, uint256 price);

    event EtherWithdrawn(address indexed _account, uint256 _amount);

    modifier accountFrozenStatus(address _account, bool _expected){
        if (accountFrozen[_account] == _expected) {
            _;
        }
    }

// reset address of User contract
    function resetUser(User _userContract) onlyowner contractIsAdminOnly {
        userContract = _userContract;
    }

    function setAffiliatePercent(uint8 _percentage) onlyowner {
        if (_percentage >= 0 && _percentage < 100) {
            uint8 old = affiliatePercent;
            affiliatePercent = _percentage;
            AffilliatePercentageChanged(old, _percentage);
        }
    }

// don't allow payments to contracts ir from or to frozen accounts
    function buyCoins(uint256 _amount, address _seller) payable contractIsActive accountFrozenStatus(_seller, false) accountFrozenStatus(msg.sender, false) {
        uint256 sellPrice = 1;
        (sellPrice,) = getPrices(_seller);

        uint256 etherCost = sellPrice * _amount;

        if (validatePurchase(_amount, _seller, etherCost, msg.value) == false) {
        // credit sender with ether, they need to pull
            etherBalances[msg.sender] += msg.value;
            return;
        }
        EtherShare memory shares = calculateAffiliateShares(msg.sender, msg.value);
        etherBalances[_seller] += shares.ozcoinShare;
        if (_seller == ozCoinAccount) {
            OzCoinPaid(msg.sender, shares.ozcoinShare);
        }

        if (shares.affiliateShare > 0) {
            etherBalances[shares.affiliate] += shares.affiliateShare;
            AffiliatePaid(msg.sender, shares.affiliate, shares.affiliateShare);
        }
        if (shares.companyShare > 0) {
            etherBalances[shares.company] += shares.companyShare;
            AffiliatePaid(msg.sender, shares.company, shares.companyShare);
        }
    // transfer tokens
        uint256 sent = tokenData.transfer(_seller, msg.sender, _amount, 0);
        if (sent > 0) {
            Transfer(_seller, msg.sender, sent);
            Transfer(_seller, ozCoinAccount, _amount - sent);
        }

    }

    function validatePurchase(uint256 _amount, address _seller, uint256 _etherCost, uint256 _etherSupplied) internal returns (bool){

        if (isContract(msg.sender)) {
            return false;
        }

        if (_seller == msg.sender) {
            return false;
        }

        if (_etherCost <= 0) {
            return false;
        }

        if (_etherCost > _etherSupplied) {
            InsufficientFunds(msg.sender, _etherSupplied, _etherCost);
            return false;
        }

        return true;
    }


// returns ozcoin share, affiliate address affiliate share , company address compnay share
    function calculateAffiliateShares(address _buyer, uint256 _cost) internal returns (EtherShare){

        EtherShare memory thisShare;
        address affiliate;
        address company;
        (affiliate, company) = getAffiliateInfo(_buyer);
        thisShare.affiliate = affiliate;
        thisShare.company = company;

    // distribute ether to ozcoin and shares to affiliate and company
        uint256 standardShare = affiliatePercent * _cost / 100;
        uint256 ozShare = msg.value;

        if (thisShare.affiliate != 0x0) {
            thisShare.affiliateShare = standardShare;
            ozShare = ozShare - standardShare;
        }
        if (thisShare.company != 0x0) {
            thisShare.companyShare = standardShare;
            ozShare = ozShare - standardShare;
        }
        thisShare.ozcoinShare = ozShare;
        return thisShare;
    }

    function getAffiliateInfo(address _account) constant returns (address, address){
        address affiliate = userContract.getAffiliate(_account);
        address company = userContract.getAffiliateCompany(_account);

        return (affiliate, company);

    }

    function getAffiliateBalance(address _account) constant returns (uint256){
        return etherBalances[_account];
    }

    function withdrawEther() contractIsActive accountFrozenStatus(msg.sender, false) external returns (bool success){
        uint amount = etherBalances[msg.sender];
        etherBalances[msg.sender] = 0;
        if (msg.sender.send(amount)) {
            EtherWithdrawn(msg.sender, amount);
            return true;
        }
        else {
            etherBalances[msg.sender] = amount;
            return false;
        }
    }

    function withdrawAllEther() contractIsActive external returns (bool success){
        if (msg.sender != ozCoinAccount) {
            return false;
        }
        uint256 amount = this.balance;
        if (ozCoinAccount.send(amount)) {
            return true;
        }
        else {
            return false;
        }
    }

    function getPrices(address _seller) constant returns (uint256, uint256) {
        return (prices[_seller].buy, prices[_seller].sell);
    }

// anyone can change their own price
    function setPrice(bool _isBuy, uint256 _price) contractIsActive accountFrozenStatus(msg.sender, false) external {
        if (_isBuy) {
            prices[msg.sender].buy = _price;
        }
        else {
            prices[msg.sender].sell = _price;
        }
        PriceSet(msg.sender, _isBuy, _price);

    }

//Admin functions
    function freezeAccount(address _account) onlyowner external {
        accountFrozen[_account] = true;
    }

    function unFreezeAccount(address _account) onlyowner external {
        accountFrozen[_account] = false;
    }

    function requestArbitration(){
        tokenData.requestArbitration(msg.sender);
    // ? auto freezeAccount
    }


}
