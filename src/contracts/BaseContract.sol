pragma solidity ^0.4.0;

contract Owned {
    address public owner;

    modifier onlyowner() {
        if (msg.sender == owner) {
            _;
        }
    }

    event OwnerChanged(address oldOwner,address newOwner);

    function Owned() {
        owner = msg.sender;
    }

    function changeOwner(address _newOwner) onlyowner {
      address oldOwner = owner;
      owner = _newOwner;
      OwnerChanged(oldOwner,_newOwner);
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



  function kill() onlyowner {
        setContractAdminOnly();
        selfdestruct(owner);
      }


}




contract BaseContract is Mortal {
  
  modifier contractOnly(address _contract, bool expected){
    if(isContract(_contract)==expected){
      _;
    }
  }


}
