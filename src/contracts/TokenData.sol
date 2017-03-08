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
uint16 transactionFeePercent;

address exchangeController;
address walletController;
address ozCoinAccount;
address arbiterAccount;
address feeAccount;
TokenData cloneParent;
uint256 totalSupply;


mapping (address=>uint256) public coins;
mapping (bytes32=>Arbitration) arbitrations;


event CoinsMinted(uint256 _amount);
event AccountChanged(string indexed name, address newAddress);
event ArbitrationRequested(address indexed requester,bytes32 ID);
event ArbitrationApproved(address indexed approver,bytes32 ID);
event ArbitrationTransfer(address indexed source,address destination, address sender,uint256 amount);
event InsufficientOZCBalance(address _seller, address _buyer, uint256 requiredAmount);


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

function TokenData(uint256 _totalSupply,address _ozCoinAccount, TokenData _cloneParent){
  ozCoinAccount = _ozCoinAccount;
  cloneParent = _cloneParent;
  mintCoins(_totalSupply);
}


function mintCoins(uint256 _amount) onlyowner{
  totalSupply += _amount;
  coins[ozCoinAccount] += _amount;
  CoinsMinted(_amount);
}

function setWalletController(address _walletController) onlyowner contractIsAdminOnly  external{
     walletController = _walletController;
}

function setExchangeController(address _exchangeController) onlyowner contractIsAdminOnly external{
     exchangeController = _exchangeController;
}

// reinstate onlyController
function getOzCoinAccount() constant  returns (address)  {
  return ozCoinAccount;
}

// only allow next three when contract is inactive
function setOzCoinAccount(address _account) onlyowner contractIsAdminOnly  {
   ozCoinAccount = _account;
   AccountChanged("Oz Coin account",_account);
}

function setArbitrationAccount(address _account) onlyowner contractIsAdminOnly  {
  if(_account!=ozCoinAccount){
    arbiterAccount = _account;
    AccountChanged("Arbiter account",_account);
 }
}

function setFeeAccount(address _account) onlyowner contractIsAdminOnly {
   feeAccount = _account;
   AccountChanged("Fee account",_account);
}


function setArbitrationLimit(uint16 _limit) onlyowner contractIsAdminOnly {
  if(_limit > 0){
    arbitrationLimit = _limit;
  }
}

function fillFromParent(address _account) onlyowner contractIsAdminOnly external{
  if (_account!=0x0){
    coins[_account] = cloneParent.balanceOf(_account);
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
  // first send fee to fee account
  coins[_sender]  = coins[_sender] - fee;
  coins[feeAccount]  =  coins[feeAccount] + fee;
  //now send rest to recipient
  coins[_sender]  = coins[_sender] - transferAmount;
  coins[_recipient]  =  coins[_recipient] + transferAmount;

  return (transferAmount);
}

function setFeePercent(uint16 _fee) external onlyController contractIsActive {
    if(_fee>=0 && _fee <10000 ){
      transactionFeePercent = _fee;
    }
}

function getFeePercent()  constant external returns (uint16){
    return transactionFeePercent;
}

function calculateFee(uint256 _amount) constant returns (uint256){
  uint256 fee = transactionFeePercent*_amount/10000;
  return fee;
}



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


function aribtrateTransfer(address _source,address _destination, uint256 _value, bytes32 _ID) external onlyArbiter contractIsActive sufficientFunds(_source,_value) contractOnly(msg.sender,false) {
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
