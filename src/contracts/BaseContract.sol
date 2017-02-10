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

  ContractState contractState;

  modifier contractIsActive(){ if (contractState==ContractState.active) _;
  }
  function activateContract() onlyowner {
     contractState = ContractState.active;
  }

  function setContractAdminOnly() onlyowner {
     contractState = ContractState.adminOnly;
  }

  function kill() onlyowner {
        setContractAdminOnly();
        selfdestruct(owner);
      }
}


contract NameRegistry is owned,mortal{

  mapping (string=>address) contracts;
  mapping (string=>string) abi;

  function NameRegistry(){
  }

  function addMapping(string _name,address _address,string _abi) external {
        contracts[_name]=_address;
        abi[_name] = _abi;
  }

  function getContractDetails(string _name) external constant returns (address,string){
        return (contracts[_name],abi[_name]);
  }
}

contract BaseContract is mortal {


}
