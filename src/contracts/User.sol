pragma solidity ^0.4.0;
contract User{

    enum Role{
        Administrator,
        Minter,
        Arbitrator,
        CertificateCreator,
        CoinOwner,
        Auditor,
        EscrowAgent,
        Affiliate

    }

    struct UserDetails{
        bytes32 name;
        Role role;
        string details;
    }

    mapping(address => UserDetails) users;

    function User(){

    }

    // modifier so only owner can set up for roles other than CoinOwner
    function createUser(address _account,bytes32 _name,Role _role,string _details) internal returns (uint256){
      users[_account]   = UserDetails({name : _name, role : _role, details : _details });
    }

    function createCoinOwner(address _account,bytes32 name,string _details) external returns (uint256){
        createUser(_account,name,Role.CoinOwner,_details);
    }



    function getUserDetails(address _account) constant returns (bytes32,Role,string){
      return (users[_account].name,users[_account].role,users[_account].details);

    }




}
