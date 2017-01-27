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
        Affiliate,
        AffiliateCompany

    }

    struct UserDetails{
        bytes32 name;
        Role role;
        string details;
        bool active;
        address linkedAccount;
    }

    mapping(address => UserDetails) private users;
    address [] private userAccounts;


    modifier accountIsValid(address _account){
        if (_account != 0x0){
            _;
        }
    }

    modifier userActiveStatus(address _account,bool _status){
        if(users[_account].active == _status){
            _;
        }
    }

     modifier stringNotEmpty(string _input){
        if(bytes(_input).length >0 ){
      _;
    }
    }

    event UserAdded(address indexed _account,Role _role);
    event UserDeactivated(address indexed _account);
    event UserReactivated(address indexed _account);

    function User(){

    }

    // Normal User Accounts
   function createCoinOwner(address _account,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.CoinOwner,_details);
    }

   function createMinter(address _account,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.Minter,_details);
    }

    function createCertificateCreator(address _account,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.CertificateCreator,_details);
    }

    function createAuditor(address _account,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.Auditor,_details);
    }

    function createEscrowAgent(address _account,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.EscrowAgent,_details);
    }

    function createAffiliate(address _account,address _affiliateCompany,bytes32 name,string _details)  external {
        createUser(_account,0x0,name,Role.Affiliate,_details);
    }

   function createAffiliateCompany(address _account,address _company,bytes32 name,string _details)  external {
        createUser(_account,_company,name,Role.AffiliateCompany,_details);
    }


    function createUser(address _account,address _linkedAccount,bytes32 _name,Role _role,string _details) accountIsValid(_account)  internal returns (uint256){
      users[_account]   = UserDetails({name : _name, role : _role, details : _details ,linkedAccount : _linkedAccount, active : true});
      userAccounts.push(_account);
      UserAdded(_account,_role);
    }



    function getUserDetails(address _account) external constant returns (bytes32,Role,string){
      return (users[_account].name,users[_account].role,users[_account].details);
    }

    function getTotalNumberOfUsers() external constant returns (uint256){
        return userAccounts.length;
    }

    function deActivateUser(address _account) userActiveStatus(_account,true) external {
        users[_account].active = false;
        UserDeactivated(_account);

    }

    function reActivateUser(address _account) userActiveStatus(_account,false) external {
        users[_account].active = true;
        UserReactivated(_account);
    }

}
