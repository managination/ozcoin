pragma solidity ^0.4.0;
import "BaseContract.sol";

contract TokenData is BaseContract {

struct Price{
    uint256 buy;
    uint256 sell;
}

struct PendingTransfer{
  uint256 value;
  address sender;
  address recipient;
  uint256 transferTime;
}

address controller;
address ozCoinAccount;
string public name;
uint256 totalSupply;
uint256 transactionFee;


// have total ether amount so can do checks of before and after

mapping (address=>uint256) coins;
mapping (address=>uint256) etherBalance;
mapping(address=>Price) prices;

PendingTransfer[] pendingTransfers;

event ControllerChanged(address controller);
event ozCoinAccountChanged(address ozCoin);
event pendingActivated(address sender,address recipient,uint256 value);

// reinstate
modifier onlyController(){
//   if (msg.sender==controller){
//     _;
//   }
    _;
}


modifier sufficientFunds(address _sender,uint256 _amount){
  if (_amount > 0 && coins[_sender] >= _amount){
    _;
  }
}

function TokenData(uint256 _totalSupply,address _controller,address _ozCoinAccount){
  totalSupply = _totalSupply;
  coins[_ozCoinAccount] = totalSupply;
  controller = _controller;
  ozCoinAccount = _ozCoinAccount;
  activateContract();
}



function setController(address _controller) onlyowner external{
     controller = _controller;
}


// some security even though a constant function
function getOzCoinAccount() onlyController constant returns (address)  {
  return ozCoinAccount;
}

// only allow next two when contract is inactive
function setOzCoinAccount(address _account) onlyController contractIsAdminOnly {
   ozCoinAccount = _account;
}


function checkStatus() returns (ContractState,uint8,address) {
    return (contractState,version,controller);
}

function getTotalSupply() onlyController  constant external returns (uint256) {
  return totalSupply;
}

function balanceOf(address _owner) onlyController constant external returns (uint256){
  return coins[_owner];

}

// this is just the actual transfer, the fee has already been taken care of
// this may be called more than once in a transaction
function transfer(address _sender,address _recipient, uint256 _value,uint256 _transferTime)
 onlyController contractIsActive sufficientFunds(_sender,_value)
  returns (bool){

  if(_transferTime>0){
    coins[_sender]  = coins[_sender] - _value;
    pendingTransfers.push(PendingTransfer({sender : _sender,recipient : _recipient, value : _value, transferTime : _transferTime}));
  }
  else{
    coins[_sender]  = coins[_sender] - _value;
    coins[_recipient]  =  coins[_recipient] + _value;
  }

  return true;
}

function setFeeRate(uint256 _fee) onlyController contractIsActive {
    transactionFee = _fee;
}

function getFeeRate() onlyController constant returns (uint256){
    return transactionFee;
}

function getPrice(address _seller,bool _isBuy) onlyController constant returns (uint256) {
    if(_isBuy){
      return prices[_seller].buy;
    }
    else{
      return prices[_seller].sell;
    }
}

function addEther() onlyController {

}

function withdrawEther() onlyController returns (bool){

}

// returns the index of the transfer in the array
function getPendingTransfers() onlyController constant returns (uint256 []) {
uint256 [] memory validTransfers = new uint256 [] (pendingTransfers.length);
for (uint256 ii= 0;ii<pendingTransfers.length;ii++){
  validTransfers[ii] = pendingTransfers[ii].transferTime;
  }


return validTransfers;
}

function activatePendingTransfer(uint256 _index){

  address sender = pendingTransfers[_index].sender;
  address recipient = pendingTransfers[_index].recipient;
  uint256 value = pendingTransfers[_index].value;
  coins[recipient]  =  coins[recipient] + value;

  deletePendingTransfer(_index);
  pendingActivated(sender,recipient,value);

}

function deletePendingTransfer(uint256 index) internal{
  if (pendingTransfers.length>0){
    pendingTransfers[index] = pendingTransfers[pendingTransfers.length-1];
  }
  pendingTransfers.length--;
}

}
