pragma solidity ^0.4.0;
import "ExchangeToken.sol";
import "TokenData.sol";

import "User.sol";

// at startup display vesion and price from ozcoin account
// include blocknumbers in events
// generate tokens function - have initialise to activate contract, set admin address, ozcoin address, and generate tokens
// check all payments got to accounts rather than contracts


contract StandardToken is ExchangeToken {


User userContract;
mapping (address=>uint256) etherBalances;


event TransactionFeeChanged(uint256 oldRate,uint256 newRate);
event OzCoinPaid(address _sender,uint256 _amount);
event AffiliatePaid(address _sender,address _affiliate,uint256 _amount);
event InsufficientFunds(address _account,uint256 _offered, uint256 _required);

event AccountFrozen(address _account);
event AccountUnFrozen(address _account);
event ArbitrationRequested(address _account,bytes32 ID);



function StandardToken(){

}

function resetUser(User _userContract) onlyowner {
  userContract = _userContract;
}


    // modifier only admin
  function setTransactionFee(uint256 _fee) returns(bool success){
    uint256 old = tokenData.getFeeRate();
    tokenData.setFeeRate(_fee);
    TransactionFeeChanged(old,_fee);
    return (true);
  }



  // modifiers needed
  // checks seller has sufficient coins
  // check buyer has enough ether for coin plus fee

   function buyCoins (uint256 _amount,address _seller) payable returns (bool success){
     uint256 fee = calculateTransactionFee(_amount);
     uint256 sellPrice;
     (sellPrice,)  = tokenData.getPrices(_seller);

     if(fee+sellPrice > _amount){
       InsufficientFunds(msg.sender,_amount,fee+sellPrice);
       return (false);
        }
     else{

      address ozCoinAccount = tokenData.getOzCoinAccount();
      // bool sendFlag =  ozCoinAccount.send(msg.value);
      address affiliateAccount;
      address affiliateCompany;

      (affiliateAccount,affiliateCompany) = getAffiliateInfo(msg.sender);

       // distribute ether
       // 90% to ozcoin
       // 5% each to affiliate and company
       uint256 affiliateShare = 5 * msg.value / 100;
       uint256 ozShare = msg.value;

       if(affiliateAccount!=0x0){
         etherBalances[affiliateAccount] = affiliateShare;
         ozShare = ozShare - affiliateShare;
         AffiliatePaid(msg.sender,affiliateAccount,affiliateShare);
       }
       if(affiliateCompany!=0x0){
         etherBalances[affiliateCompany] = affiliateShare;
         ozShare = ozShare - affiliateShare;
         AffiliatePaid(msg.sender,affiliateCompany,affiliateShare);
       }

       tokenData.transfer(ozCoinAccount,msg.sender,_amount,0);

       //check return value
       Transfer(ozCoinAccount,msg.sender, fee);

       bool sendSuccess =  ozCoinAccount.send(ozShare);
       OzCoinPaid(msg.sender,ozShare);

     }
   }


function getAffiliateInfo(address _account) returns (address,address){
  address affiliate = userContract.getAffiliate(_account);
  address company = userContract.getAffiliateCompany(_account);

  return (affiliate,company);

}

function getAffiliateBalance() constant returns(uint256){
    return etherBalances[msg.sender];
}

function withdrawEther () returns (bool success){

}


function setPrice(bool _isBuy,uint256 _price) {
  tokenData.setPrice(msg.sender,_isBuy,_price);
}

function getPrices(address _user) constant returns(uint256 _buyPrice,uint256 _sellPrice){
  return tokenData.getPrices(_user);
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
