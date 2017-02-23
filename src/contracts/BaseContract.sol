pragma solidity ^0.4.0;

contract owned {
    address owner;
    address admin;

    modifier onlyowner() {
        if (msg.sender == owner) {
            _;
        }
    }

    function owned() {
        owner = msg.sender;
    }

    function setAdmin(address _admin) onlyowner() {
      admin = _admin;
    }
}

contract mortal is owned {
   enum ContractState{
     adminOnly,
     active
   }

  ContractState public contractState;
  uint8 public version;

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

  function setVersion(uint8 _version){
    version = _version;
  }

  function kill() onlyowner {
        setContractAdminOnly();
        selfdestruct(owner);
      }


}




contract BaseContract is mortal {

  modifier addressesDifferent(address address1,address address2){
    if(address1 != address2 ){
      _;
    }
  }

  modifier valueInRange(uint256 value,uint256 min,uint256 max){
    if(value >= min && value <= max ){
      _;
    }
  }


}
