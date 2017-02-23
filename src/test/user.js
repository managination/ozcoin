var User = artifacts.require("./User.sol");
var Certificate = artifacts.require("./Certificate.sol");

contract('User', function(accounts) {


  var administrator = accounts[6];
  var affiliateAccount = accounts[3];
  var affiliateCompany = accounts[4];

    it("should check no users exist", function() {
        var user = User.new().then(function(instance) {
            instance.getTotalNumberOfUsers.call().then(function(num) {
                return assert.equal(num.valueOf(), 0);
            });
        });
    });

    it("should create an Administrator, then a Coin User", function() {
        var user = User.new().then(function(instance) {
          instance.createAdministrator.sendTransaction(administrator, "Admin", "{address : Admin Street,phone : 0207 999 9999}",{from: accounts[0] }).then(function(Tx1) {
            instance.createCoinOwner.sendTransaction(accounts[1], affiliateAccount,affiliateCompany, "John Doe", "{address : St John's Street,phone : 0207 568 1255}").then(function(Tx2) {
                instance.getTotalNumberOfUsers.call().then(function(num) {
                    return assert.equal(num.valueOf(), 2);

                });
            });
        });
    });
      });

    it("should create a Coin User, then change roles", function() {
        var user = User.new().then(function(instance) {
          instance.createAdministrator.sendTransaction(administrator, "Admin", "{address : Admin Street,phone : 0207 999 9999}",{from: accounts[0] }).then(function(Tx1) {
           instance.createCoinOwner.sendTransaction(accounts[5], affiliateAccount,affiliateCompany,"Peter Brown", "{address : St John's Street,phone : 0207 568 1255}",{from: administrator }).then(function(Tx) {
                instance.changeRole.sendTransaction(accounts[5],5,{from: administrator}).then(function(Tx2) {
                    instance.checkRegistration.call(accounts[5]).then(function(results) {
                        assert.equal(results[0], true);
                        assert.equal(results[1].valueOf(), 5);
                        // now reassign role
                        instance.changeRole.sendTransaction(accounts[5],6,{from: administrator }).then(function(Tx3) {
                            instance.checkRegistration.call(accounts[5]).then(function(results2) {
                            assert.equal(results2[0], true);
                            assert.equal(results2[1].valueOf(), 6);

                        });
                        });
                    });
                  });
                });
            });
        });
    });

    it("should create a Coin User, then fail to change role to admin", function() {
        var user = User.deployed().then(function(instance) {
          instance.createAdministrator.sendTransaction(administrator, "Admin", "{address : Admin Street,phone : 0207 999 9999}",{from: accounts[0] }).then(function(Tx1) {
           instance.createCoinOwner.sendTransaction(accounts[5], affiliateAccount,affiliateCompany,"Peter Brown", "{address : St John's Street,phone : 0207 568 1255}",{from: administrator }).then(function(Tx) {
                instance.changeRole.sendTransaction(accounts[5],1,{from: administrator}).then(function(Tx2) {
                    instance.checkRegistration.call(accounts[5]).then(function(results) {
                        assert.equal(results[0], true);
                        assert.equal(results[1].valueOf(), 0);

                    });
                  });
                });
            });
        });
    });


    it("should fail to change role if user not registered", function() {
        var user = User.new().then(function(instance) {
          instance.createAdministrator.sendTransaction(administrator, "Admin", "{address : Admin Street,phone : 0207 999 9999}",{from: accounts[0] }).then(function(Tx1) {
                instance.changeRole.sendTransaction(accounts[5],3,{from: administrator}).then(function(Tx2) {
                    instance.checkRegistration.call(accounts[5]).then(function(results) {
                        assert.equal(results[0], false);
                        assert.equal(results[1].valueOf(), 0);

                
                  });
                });
            });
        });
    });



});
