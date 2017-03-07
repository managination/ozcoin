pragma solidity ^0.4.0;
import "./BaseContract.sol";

contract TokenData is BaseContract {

struct PendingTransfer{
  uint256 value;
  address sender;
  address recipient;
  uint64 transferTime;
}

struct Arbitration {
  address requester;
  uint256 requesterVote;
  uint256 ozVote;
}

uint16 arbitrationLimit = 500;
uint8 transactionFeePercent;

address exchangeController;
address walletController;
address ozCoinAccount;
address arbiterAccount;
uint256 totalSupply;


mapping (address=>uint256) coins;
mapping (bytes32=>Arbitration) arbitrations;

PendingTransfer[] pendingTransfers;

event ControllerChanged(address controller);
event OzCoinAccountChanged(address ozCoin);
event CoinsMined(uint256 _amount);
event ArbiterChanged(address arbiterAccount);
event ArbitrationRequested(address indexed requester,bytes32 ID);
event ArbitrationApproved(address indexed approver,bytes32 ID);
event ArbitrationTransfer(address indexed source,address destination, address sender,uint256 amount);

//event PendingActivated(address sender,address recipient,uint256 value);

event InsufficientOZCBalance(address _seller, address _buyer, uint256 requiredAmount);

// remove
event Sender(address sender);

modifier onlyController(){
   if (msg.sender==exchangeController||msg.sender==walletController){
     _;
   }
}

modifier onlyOzCoin(){
   if (msg.sender==ozCoinAccount){
     _;
   }
}

modifier onlyArbiter(){
   if (msg.sender==arbiterAccount){
     _;
   }
}

modifier sufficientFunds(address _sender,uint256 _amount){
  if (_amount > 0 && coins[_sender] >= _amount){
    _;
  }
}

function TokenData(uint256 _totalSupply,address _ozCoinAccount){
  ozCoinAccount = _ozCoinAccount;
  mineCoins(_totalSupply);
}


function mineCoins(uint256 _amount) onlyowner{
  totalSupply += _amount;
  coins[ozCoinAccount] += _amount;
  CoinsMined(_amount);
}

function setWalletController(address _walletController) onlyowner contractIsAdminOnly contractOnly(msg.sender, false) external{
     walletController = _walletController;
}

function setExchangeController(address _exchangeController) onlyowner contractIsAdminOnly contractOnly(msg.sender,false) external{
     exchangeController = _exchangeController;
}

// reinstate onlyController
function getOzCoinAccount() constant  returns (address)  {
  return ozCoinAccount;
}

// only allow next two when contract is inactive, can't be called from a contract
function setOzCoinAccount(address _account) onlyowner contractIsAdminOnly contractOnly(msg.sender,false) {
   ozCoinAccount = _account;
   OzCoinAccountChanged(_account);
}

function setArbitrationAccount(address _account) onlyowner contractIsAdminOnly contractOnly(msg.sender,false) {
  if(_account!=ozCoinAccount){
    arbiterAccount = _account;
    ArbiterChanged(_account);
 }
}

function setArbitrationLimit(uint16 _limit) onlyowner contractIsAdminOnly contractOnly(msg.sender,false) {
  if(_limit > 0){
    arbitrationLimit = _limit;
  }
}

function checkStatus() constant external returns (ContractState,address,address,address,address,uint16)  {
    return (contractState,ozCoinAccount,exchangeController,walletController,arbiterAccount,arbitrationLimit);
}

function getTotalSupply() constant  external returns (uint256) {
  return totalSupply;
}

function balanceOf(address _owner) constant external returns (uint256){
  return coins[_owner];

}
function getOwner() returns(address){
  return owner;
}

function transfer(address _sender,address _recipient, uint256 _value,uint64 _transferTime)
  onlyController
  contractIsActive contractOnly (msg.sender,true)
  returns (uint256){

  // test for sufficientFunds in seller account
  if(_value > coins[_sender] ){
    InsufficientOZCBalance(_sender,_recipient,_value);
    return 0;
  }

  uint256 fee = calculateFee(_value);
  uint256 transferAmount = _value - fee;//safeSub(_value,fee);
  if(transferAmount<=0){
    return (0);
  }
  // first send fee to ozcoin
  coins[_sender]  = coins[_sender] - fee;
  coins[ozCoinAccount]  =  coins[ozCoinAccount] + fee;
  //now send rest to recipient
  if(_transferTime>0){
    coins[_sender]  = coins[_sender] - transferAmount;
    pendingTransfers.push(PendingTransfer({sender : _sender,recipient : _recipient, value : transferAmount, transferTime : _transferTime}));
  }
  else{
    coins[_sender]  = coins[_sender] - transferAmount;
    coins[_recipient]  =  coins[_recipient] + transferAmount;
  }

  return (transferAmount);
}

function setFeePercent(uint8 _fee) external onlyowner contractIsActive {
    if(_fee>=0 && _fee <100 ){
      transactionFeePercent = _fee;
    }
}

function getFeePercent()  constant external returns (uint8){
    return transactionFeePercent;
}

function calculateFee(uint256 _amount) internal constant returns (uint256){
  uint256 fee = transactionFeePercent*_amount/100;
  return fee;
}


/*// returns the index of the transfer in the array
function getPendingTransfers() constant external onlyController contractIsActive contractOnly(msg.sender,true)  returns (uint256 []) {
uint256 [] memory validTransfers = new uint256 [] (pendingTransfers.length);
for (uint256 ii= 0;ii<pendingTransfers.length;ii++){
  validTransfers[ii] = pendingTransfers[ii].transferTime;
  }

return validTransfers;
}

// ? where would this sbe called from
function activatePendingTransfer(uint256 _index) onlyController contractIsActive contractOnly(msg.sender,true) external contractIsActive {

  address sender = pendingTransfers[_index].sender;
  address recipient = pendingTransfers[_index].recipient;
  uint256 value = pendingTransfers[_index].value;
  coins[recipient]  =  coins[recipient] + value;

  deletePendingTransfer(_index);
  PendingActivated(sender,recipient,value);

}

function deletePendingTransfer(uint256 index) internal{
  if (pendingTransfers.length>0){
    pendingTransfers[index] = pendingTransfers[pendingTransfers.length-1];
  }
  pendingTransfers.length--;
}*/


function requestArbitration( address _requester) external onlyController contractIsActive contractOnly(msg.sender,true){
  uint256 blk = block.number;
  bytes32 ID = sha3(msg.sender,blk);

  if(arbitrations[ID].requesterVote==0){
    arbitrations[ID].requester = _requester;
    arbitrations[ID].requesterVote = blk;
    arbitrations[ID].ozVote = 0;
    ArbitrationRequested(_requester,ID);
  }
}

// ozcoin account approves arbitration
function approveArbitration(bytes32 _ID) external onlyOzCoin contractIsActive contractOnly(msg.sender,false) {
  uint256 blockNum = block.number;
  if(arbitrations[_ID].requesterVote!=0){
    arbitrations[_ID].ozVote = blockNum;
    ArbitrationApproved(msg.sender,_ID);
  }
}


function aribtrateTransfer(address _source,address _destination, uint256 _value, bytes32 _ID) external onlyArbiter contractIsActive sufficientFunds(_source,_value) {
  uint256 currentBlock = block.number;
  if(arbitrations[_ID].requesterVote==0){
    return;
  }
  if(arbitrations[_ID].requester!=_source && arbitrations[_ID].requester!=_destination){
    return;
  }
  uint256 ozBlock = arbitrations[_ID].ozVote;
  if (currentBlock - ozBlock > arbitrationLimit ){
    return;
  }

  delete arbitrations[_ID];
  // do transfer
  coins[_source]  = coins[_source] - _value;
  coins[_destination]  =  coins[_destination] + _value;
  ArbitrationTransfer(_source,_destination,msg.sender,_value);
}


}
