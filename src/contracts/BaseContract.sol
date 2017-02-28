pragma solidity ^0.4.0;

contract Owned {
    address public owner;

    modifier onlyowner() {
        if (msg.sender == owner) {
            _;
        }
    }

    function Owned() {
        owner = msg.sender;
    }

}

contract Mortal is Owned {
   enum ContractState{
     adminOnly,
     active
   }

  ContractState public contractState;

  modifier contractIsActive(){
      if (contractState==ContractState.active) _;
  }

  modifier contractIsAdminOnly(){
      if (contractState==ContractState.adminOnly) _;
  }

  function activateContract() onlyowner {
     contractState = ContractState.active;
  }

  function setContractAdminOnly() onlyowner {
     contractState = ContractState.adminOnly;
  }

  function isContract(address addr) returns (bool) {
    uint size;
    assembly { size := extcodesize(addr) }
    return size > 1;
  }

  /*function isContract2(address addr) returns (uint256) {
    uint size;
    assembly { size := extcodesize(addr) }
    return size;
  }*/

  function kill() onlyowner {
        setContractAdminOnly();
        selfdestruct(owner);
      }


}




contract BaseContract is Mortal {



}
