pragma solidity ^0.4.0;
import "./TokenData.sol";
import "./ExchangeTokenInterface.sol";
import "./BaseContract.sol";



contract ExchangeToken is ExchangeTokenInterface,BaseContract{

TokenData tokenData;  // address of data contract
address ozCoinAccount;

event TransactionFeeChanged(uint16 oldRate,uint16 newRate);

function ExchangeToken(){

}


function resetTokenData(TokenData _tokenData) onlyowner contractIsAdminOnly {
  tokenData = _tokenData;
  ozCoinAccount = tokenData.getOzCoinAccount();
}

function getOzAccount() constant returns (address){
  return ozCoinAccount;
}

function totalSupply() constant returns (uint256 totalSupply){
  return tokenData.getTotalSupply();
}

function balanceOf(address _owner) constant returns (uint256 balance){
  return tokenData.balanceOf(_owner);

}


// exchange can transfer
// can't assume user is registered
//sufficientFunds(msg.sender,_value)
function transfer(address _to, uint256 _value) returns (bool success){
  // change for pending
  uint64 transferTime = 0;
  uint256 received = tokenData.transfer(msg.sender,_to,_value,transferTime);
  if(received > 0){
    //check return value
    Transfer(msg.sender, _to, received);
    // difference is fee
    Transfer(msg.sender, ozCoinAccount, _value - received);
  }
}

function setFeePercent(uint16 _fee) external onlyowner {
    uint16 old = tokenData.getFeePercent();
    tokenData.setFeePercent(_fee);
    TransactionFeeChanged(old,_fee);
}

function getFeePercent() constant external returns (uint16){
  return tokenData.getFeePercent();
}

function calculateFee(uint256 _amount) internal constant returns (uint256){
  uint256 fee = tokenData.calculateFee(_amount);
  return fee;
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
