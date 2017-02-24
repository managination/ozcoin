pragma solidity ^0.4.0;
import "ExchangeToken.sol";
import "TokenData.sol";

import "User.sol";

// at startup display vesion and price from ozcoin account
// include blocknumbers in events
// generate tokens function - have initialise to activate contract, set admin address, ozcoin address, and generate tokens
// check all payments got to accounts rather than contracts


contract StandardToken is ExchangeToken {

  struct Price{
      uint256 buy;
      uint256 sell;
  }

User userContract;
address ozCoinAccount;

mapping (address=>uint256) etherBalances;

mapping (address=>Price) prices;

event TransactionFeeChanged(uint256 oldRate,uint256 newRate);
event OzCoinPaid(address indexed _sender,uint256 _amount);
event AffiliatePaid(address indexed _sender,address _affiliate,uint256 _amount);
event InsufficientFunds(address indexed _account,uint256 _offered, uint256 _required);

event AccountFrozen(address indexed _account);
event AccountUnFrozen(address indexed _account);
event ArbitrationRequested(address indexed  _account,bytes32 ID);
event PriceSet(address indexed seller,bool side,uint256 price);



function StandardToken(){

}

function resetUser(User _userContract) onlyowner {
  userContract = _userContract;
}

function resetTokenData(TokenData _tokenData) onlyowner {
  tokenData = _tokenData;
  ozCoinAccount = tokenData.getOzCoinAccount();
}

    // modifier only admin
  function setTransactionFee(uint256 _fee) returns(bool success){
    uint256 old = tokenData.getFeeRate();
    tokenData.setFeeRate(_fee);
    TransactionFeeChanged(old,_fee);
    return (true);
  }



  // modifiers needed
  // check buyer has enough ether for coin plus fee
  // need to check amount is greater than fee
   function buyCoins (uint256 _amount,address _seller) payable returns (bool success){
     uint256 fee = calculateTransactionFee(_amount);
     uint256 sellPrice;
     (sellPrice,)  = getPrices(_seller);

     if(_amount<=fee || sellPrice <= 0){
       return (false);
     }

     if(sellPrice > msg.value){
      InsufficientFunds(msg.sender,_amount,fee+sellPrice);
      return (false);
        }
     else{


      address affiliateAccount;
      address affiliateCompany;

      (affiliateAccount,affiliateCompany) = getAffiliateInfo(msg.sender);

       // distribute ether
       // 90% to ozcoin
       // 5% each to affiliate and company
       uint256 affiliateShare = 5 * msg.value / 100;
       uint256 ozShare = msg.value;

      if(affiliateAccount!=0x0){
         etherBalances[affiliateAccount] += affiliateShare;
         ozShare = ozShare - affiliateShare;
         AffiliatePaid(msg.sender,affiliateAccount,affiliateShare);
      }
      if(affiliateCompany!=0x0){
         etherBalances[affiliateCompany] += affiliateShare;
         ozShare = ozShare - affiliateShare;
         AffiliatePaid(msg.sender,affiliateCompany,affiliateShare);
      }

        tokenData.transfer(_seller,msg.sender,_amount-fee,0);
        Transfer(_seller,msg.sender, _amount-fee);
        // send fee to ozcoin
        tokenData.transfer(_seller,ozCoinAccount,fee,0);
        Transfer(_seller,msg.sender, fee);

       bool sendSuccess =  _seller.send(ozShare);
       if(_seller==ozCoinAccount){
            OzCoinPaid(msg.sender,ozShare);
        }
     }
   }


function getAffiliateInfo(address _account) constant returns (address,address){
  address affiliate = userContract.getAffiliate(_account);
  address company = userContract.getAffiliateCompany(_account);

  return (affiliate,company);

}

function getAffiliateBalance() constant returns(uint256){
    return etherBalances[msg.sender];
}

function withdrawEther () returns (bool success){
        uint amount = etherBalances[msg.sender];
        etherBalances[msg.sender] = 0;
        if (msg.sender.send(amount)) {
            return true;
        } else {
            etherBalances[msg.sender] = amount;
            return false;
        }
}

function getPrices(address _seller) constant returns (uint256,uint256) {
      return (prices[_seller].buy,prices[_seller].sell);
}

function setPrice(bool _isBuy,uint256 _price) {
    if(_isBuy){
      prices[msg.sender].buy = _price;
    }
    else{
      prices[msg.sender].sell = _price;
    }
    PriceSet(msg.sender,_isBuy,_price);

}

//Admin functions
function freezeAccount(address _account) returns (bool success){

}
function unFreezeAccount(address _account) returns (bool success){

}

function requestArbitration(bytes32 _ID, address _account) returns (bool success){
  tokenData.requestArbitration(_ID, _account);
  // ? auto freezeAccount
}




}
