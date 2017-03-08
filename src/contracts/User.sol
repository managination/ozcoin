pragma solidity ^0.4.0;
import "./BaseContract.sol";

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
        address affiliateAccount;
        address affiliateCompany;
    }

    mapping(address => UserDetails) private users;
    address [] private userAccounts;


    modifier accountIsValid(address _account){
        if (isContract(_account)==false && _account != 0x0){
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

    modifier userIsAdmin(address _account) {
      if (users[_account].active==true && users[_account].role==Role.Administrator){
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
    event UserDetailsChanged(address indexed _account);
    event AffiiateSet(address indexed _account,address affiliate);
    event AffiiateCompanySet(address indexed _account,address affiliateCompany);

    function User(){

    }

    function getUserDetails(address _account) external constant returns (bytes32,Role,string){
      return (users[_account].name,users[_account].role,users[_account].details);
    }

    function getAffiliate(address _account) external constant returns (address){
      return (users[_account].affiliateAccount);
    }

    function getAffiliateCompany(address _account) external constant returns (address){
      return (users[_account].affiliateCompany);
    }

    function getTotalNumberOfUsers() external constant returns (uint256){
        return userAccounts.length;
    }

    function findUserRole(address _account) constant external returns (bool,Role){
      return checkRegistration(_account);
    }




    function checkRegistration(address _account) constant returns (bool,Role){
      return ((users[_account].active==true),users[_account].role);

    }

    function createCoinOwner(address _account,address _affiliateAccount,address _affiliateCompany,bytes32 _name,string _details) userActiveStatus(_account,false) accountIsValid(_account)  external returns (uint256){
      users[_account]   = UserDetails({name : _name, role : Role.CoinOwner, details : _details , affiliateAccount : _affiliateAccount, affiliateCompany : _affiliateCompany, active : true});
      userAccounts.push(_account);
      UserAdded(_account,Role.CoinOwner);
    }

    function createAdministrator(address _account,bytes32 _name,string _details) onlyowner {
      users[_account]   = UserDetails({name : _name, role : Role.Administrator, details : _details ,affiliateAccount : _account, affiliateCompany: _account,active : true});
      userAccounts.push(_account);
      UserAdded(_account,Role.Administrator);

    }

    function changeRole(address _account,Role _role) userActiveStatus(_account,true) userIsAdmin(msg.sender) external {
      if(_role!=Role.Administrator){
        users[_account].role = _role;
        UserRoleChanged(_account,_role);
      }
    }

    function setAffiliate(address _affiliate) userHasRole(msg.sender,Role.CoinOwner,true) external {
      if(_affiliate!=msg.sender){
        users[msg.sender].affiliateAccount = _affiliate;
        AffiiateSet(msg.sender,_affiliate);
      }
    }

    function setAffiliateCompany(address _affiliateCompany) userHasRole(msg.sender,Role.CoinOwner,true) external {
      if(_affiliateCompany!=msg.sender){
      users[msg.sender].affiliateCompany = _affiliateCompany;
      AffiiateCompanySet(msg.sender,_affiliateCompany);
      }
    }


    function deActivateUser(address _account) userActiveStatus(_account,true) userIsAdmin(msg.sender) external {
        users[_account].active = false;
        UserDeactivated(_account);

    }

    function reActivateUser(address _account) userActiveStatus(_account,false) userIsAdmin(msg.sender) external {
        users[_account].active = true;
        UserReactivated(_account);
    }

    // only allowed to change their own account
    function updateUserDetails(address _account, bytes32 _name,string newDetails,address _affiliateAccount,address _affiliateCompany) userActiveStatus(_account, true) {
       if(_account == msg.sender || users[msg.sender].role == Role.Administrator) {
           users[msg.sender].details = newDetails;
           users[msg.sender].name = _name;
           users[msg.sender].affiliateAccount = _affiliateAccount;
           users[msg.sender].affiliateCompany = _affiliateCompany;
           UserDetailsChanged(msg.sender);
           AffiiateSet(msg.sender,_affiliateAccount);
           AffiiateCompanySet(msg.sender,_affiliateCompany);
        }

    }

}
