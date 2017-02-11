pragma solidity ^0.4.0;

contract TokenInterface {

function totalSupply() constant returns (uint256 totalSupply);
function balanceOf(address _owner) constant returns (uint256 balance);
function transfer(address _to, uint256 _value) returns (bool success);
function transferFrom(address _from, address _to, uint256 _value) returns (bool success);
function approve(address _spender, uint256 _value) returns (bool success);
function allowance(address _owner, address _spender) constant returns (uint256 remaining);

function buyCoins (uint256 _amount,address _seller) payable returns (bool success);
function sellCoins (uint256 _amount,address _buyer) returns (bool success);
function withdrawEther () returns (bool success);
function getTransactionFee() constant returns (uint256);
function setPrice(bool isBuy,uint256 _price) returns (bool success);
function getPrices(address _user) constant returns(uint256 _buyPrice,uint256 _sellPrice);

event Transfer(address indexed _from, address indexed _to, uint256 _value);
event Approval(address indexed _owner, address indexed _spender, uint256 _value);

event UserPriceChange(address _user,bool isBuy,uint256 _price);


//Admin functions and events
function setTransactionFee(uint256 _fee) returns (bool success);
function freezeAccount(address _account) returns (bool success);
function unFreezeAccount(address _account) returns (bool success);


event TransactionFeeChanged(uint256 oldFee, uint256 newFee);
event AccountFrozen(address _account);
event AccountUnFrozen(address _account);




}
