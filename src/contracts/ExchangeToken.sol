pragma solidity ^0.4.0;
import "TokenData.sol";
import "ExchangeTokenInterface.sol";
import "BaseContract.sol";



contract ExchangeToken is ExchangeTokenInterface,BaseContract{

TokenData tokenData;  // address of data contract
//NameRegistry nameRegistry;

/*modifier sufficientFunds(address _sender,uint256 _amount){
  if (tokenData.balanceOf(_sender) >= _amount){
    _;
  }
}*/


function ExchangeToken(){

}

function resetTokenData(TokenData _tokenData) onlyowner {
  tokenData = _tokenData;
}


function totalSupply() constant returns (uint256 totalSupply){
  return tokenData.getTotalSupply();
}

function balanceOf(address _owner) constant returns (uint256 balance){
  return tokenData.balanceOf(_owner);

}

function testMySender() constant returns (address){
  return tokenData.testSender();

}


// exchange can transfer
// can't assume user is registered
//sufficientFunds(msg.sender,_value)
function transfer(address _to, uint256 _value) returns (bool success){
  //if (coins[_recipient] + _value < coins[_recipient]) throw;
  uint256 fee = calculateTransactionFee(_value);
  uint256 transferTime = 0;
  uint256 transferAmount = _value - fee;//safeSub(_value,fee);
  // first transfer to ozcoin account
  address ozCoin = tokenData.getOzCoinAccount();
  // send fee back to issuer account, not a pending transfer
  tokenData.transfer(msg.sender,ozCoin,fee,0);
  //check return value
  Transfer(msg.sender, ozCoin, fee);
  // send rest to recipient
  tokenData.transfer(msg.sender,_to,transferAmount,transferTime);
  //check return value
  Transfer(msg.sender, _to, transferAmount);
}

function getFeeRate() constant returns (uint256){
  return tokenData.getFeeRate();
}

function calculateTransactionFee(uint256 _value) internal returns(uint256){
  // for a fixed fee
  return tokenData.getFeeRate();
}

// disallow these
function transferFrom(address _from, address _to, uint256 _value) returns (bool success){
  throw;
}
function approve(address _spender, uint256 _value)  returns (bool success){
  throw;
}
function allowance(address _owner, address _spender) constant  returns (uint256 remaining){
  throw;
}

}
