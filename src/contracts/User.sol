pragma solidity ^0.4.0;
import "BaseContract.sol";

contract User is BaseContract{

    enum Role{
        CoinOwner,
        Administrator,
        Minter,
        Arbitrator,
        CertificateCreator,
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

    modifier userHasRole(address _account,Role _role,bool _expected){
      bool hasRole = false;
      if(users[_account].role == _role){
          hasRole=true;
      }
      if(hasRole==_expected){
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
    event UserRoleChanged(address indexed _account,Role _newRole);
    event UserDeactivated(address indexed _account);
    event UserReactivated(address indexed _account);
    event AffiiateSet(address indexed _account,address affiliate);

    function User(){

    }

    function getUserDetails(address _account) external constant returns (bytes32,Role,string){
      return (users[_account].name,users[_account].role,users[_account].details);
    }

    function getTotalNumberOfUsers() external constant returns (uint256){
        return userAccounts.length;
    }

    function checkRegistration(address _account) returns (bool,Role){
      return ((users[_account].active==true),users[_account].role);

    }

   function createMinter(address _account) userHasRole(_account,Role.CoinOwner,true) external {
        users[_account].role = Role.Minter;
        UserRoleChanged(_account,Role.Minter);
    }

    function createCertificateCreator(address _account) userHasRole(_account,Role.CoinOwner,true)  external {
        users[_account].role = Role.CertificateCreator;
        UserRoleChanged(_account,Role.CertificateCreator);
    }

    function createAuditor(address _account)  userHasRole(_account,Role.CoinOwner,true) external {
       users[_account].role = Role.Auditor;
       UserRoleChanged(_account,Role.Auditor);

    }

    function createEscrowAgent(address _account) userHasRole(_account,Role.CoinOwner,true) external {
        users[_account].role = Role.EscrowAgent;
        UserRoleChanged(_account,Role.EscrowAgent);
    }

   function createAffiliateCompany(address _account) userHasRole(_account,Role.CoinOwner,true) external {
       users[_account].role = Role.AffiliateCompany;
       UserRoleChanged(_account,Role.AffiliateCompany);
    }


    function createCoinOwner(address _account,address _linkedAccount,bytes32 _name,string _details) userActiveStatus(_account,false) accountIsValid(_account)  external returns (uint256){
      users[_account]   = UserDetails({name : _name, role : Role.CoinOwner, details : _details ,linkedAccount : _linkedAccount, active : true});
      userAccounts.push(_account);
      UserAdded(_account,Role.CoinOwner);
    }

    function createAdminstrator(address _account,bytes32 _name,string _details) onlyowner {
      users[_account]   = UserDetails({name : _name, role : Role.Administrator, details : _details ,linkedAccount : _account, active : true});
      userAccounts.push(_account);
      UserAdded(_account,Role.Administrator);

    }
    function setAffiliate(address _affiliate) userHasRole(msg.sender,Role.CoinOwner,true) {
      users[msg.sender].linkedAccount = _affiliate;

      AffiiateSet(msg.sender,_affiliate);

    }


    function deActivateUser(address _account) userActiveStatus(_account,true) userHasRole(_account,Role.Administrator,true) external {
        users[_account].active = false;
        UserDeactivated(_account);

    }

    function reActivateUser(address _account) userActiveStatus(_account,false) userHasRole(_account,Role.Administrator,true) external {
        users[_account].active = true;
        UserReactivated(_account);
    }

    // only allowed to change their own account
    function updateUserDetails(bytes32 _name,string newDetails,address _linkedAccount){
        users[msg.sender].details = newDetails;
        users[msg.sender].name = _name;
        users[msg.sender].linkedAccount = _linkedAccount;

    }

}
