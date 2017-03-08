var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");

contract('TokenData', function(accounts) {

    // need checks for only controller
    // need check for non active contract

    var ownerAccount = accounts[0];
    var exchangeAccount;
    var walletAccount;
    var ozAccount = accounts[3];
    var userAccount = accounts[4];
    var arbiterAccount = accounts[5];
    var initialSupply = 100000000;


    it ("should get addresses for wallet and exchange contracts check they are contract only", function(){
      return StandardToken.deployed().then(function(walletInstance) {
        walletAccount = walletInstance;
        return walletInstance.isContract.call(walletInstance.address).then(function(result) {
          assert.equal(result,true);
          return ExchangeToken.deployed().then(function(exchangeInstance) {
            exchangeAccount = exchangeInstance;
            return walletInstance.isContract.call(exchangeInstance.address).then(function(result2) {
              assert.equal(result2,true);
              console.log("owner is " + ownerAccount);
              // check normal accounts are flagged as not contract
              return walletInstance.isContract.call(ownerAccount).then(function(result3) {
                assert.equal(result3,false);
                return walletInstance.isContract.call(userAccount).then(function(result4) {
                  assert.equal(result4,false);
                  return walletInstance.isContract.call(arbiterAccount).then(function(result5) {
                    assert.equal(result5,false);
                      });
                    });
                  });

                });
              });
            });
          });
        });

    it("should return status", function() {
          TokenData.new(initialSupply, ozAccount,"0x0").then(function(instance) {
            return instance.activateContract.sendTransaction({from : ownerAccount}).then(function(Tx) {
                return instance.checkStatus.call({from : ownerAccount}).then(function(details) {
                    return assert.equal(details[1], ozAccount);
                });
            });
        });

    });

    it("should have the correct balances", function() {
        TokenData.new(initialSupply,ozAccount,"0x0").then(function(instance) {
            return instance.activateContract.sendTransaction({from : ownerAccount}).then(function(Tx) {
                return instance.balanceOf.call(ozAccount, {from : exchangeAccount.address}).then(function(balance) {
                    return assert.equal(balance.valueOf(), initialSupply);
                });
            });
        });

    });


    it("should fail functions if not called by controller", function() {
        TokenData.new(initialSupply, ozAccount,"0x0").then(function(instance) {
          return instance.activateContract.sendTransaction({from : ownerAccount}).then(function(Tx) {
              return instance.transfer.sendTransaction(ozAccount, userAccount, 10, 0,{from : userAccount}).then(function(Tx2) {
                  return instance.balanceOf.call(userAccount,{from : exchangeAccount.address}).then(function(balance) {
                    assert.equal(balance.valueOf(),0);
                  });
                });
              });
            });
    });



    it("should fail to set wallet controller if not owner", function() {
        TokenData.new(initialSupply,ozAccount,"0x0").then(function(instance) {
          return instance.setContractAdminOnly.sendTransaction({from : ownerAccount}).then(function(Tx) {
            // this should succeed
            return instance.setWalletController.sendTransaction(walletAccount,{from : ownerAccount}).then(function(Tx2) {
              // this should fail
              return instance.setWalletController.sendTransaction(userAccount,{from : userAccount}).then(function(Tx2) {
                  // user can all check status
                  return instance.checkStatus.call({from : userAccount}).then(function(details) {
                    return assert.equal(details[3],walletAccount.address);
                  });
                });
                });
              });
            });
          });

    it("should fail to set wallet controller if contract is active", function() {
        TokenData.new(initialSupply,ozAccount,"0x0").then(function(instance) {
          return instance.setContractAdminOnly.sendTransaction({from : ownerAccount}).then(function(Tx) {
                return instance.setWalletController.sendTransaction(walletAccount,{from : ownerAccount}).then(function(Tx2) {
                  return instance.activateContract.sendTransaction({from : ownerAccount}).then(function(Tx) {
              // this should fail
              return instance.setWalletController.sendTransaction(userAccount,{from : ownerAccount}).then(function(Tx2) {
                  return instance.checkStatus.call({from : ownerAccount}).then(function(details) {
                    return assert.equal(details[3],walletAccount.address);
                  });
                });
                    });
              });
            });
          });
          });

          it("should set wallet controller if contract is not active", function() {
              TokenData.new(initialSupply, ozAccount,"0x0").then(function(instance) {
                  return instance.setContractAdminOnly.sendTransaction({from : ownerAccount}).then(function(Tx2) {
                    return instance.setWalletController.sendTransaction(userAccount,{from : ownerAccount}).then(function(Tx3) {
                        return instance.checkStatus.call({from : ownerAccount}).then(function(details) {
                          return assert.equal(details[3],userAccount);
                        });
                      });
                    });
                  });
                });

                it("should set exchange controller if contract is not active", function() {
                    TokenData.new(initialSupply, ozAccount,"0x0").then(function(instance) {
                        return instance.setContractAdminOnly.sendTransaction({from : ownerAccount}).then(function(Tx2) {
                          return instance.setExchangeController.sendTransaction(userAccount,{from : ownerAccount}).then(function(Tx3) {
                              return instance.checkStatus.call({from : ownerAccount}).then(function(details) {
                                return assert.equal(details[2],userAccount);
                              });
                            });
                          });
                        });
                      });


              it("should set an arbitration limit then allow arbitration", function() {
                  TokenData.new(initialSupply,ozAccount,"0x0").then(function(instance) {
                  return instance.setContractAdminOnly.sendTransaction({from : ownerAccount}).then(function(Tx) {
                      return instance.setArbitrationLimit.sendTransaction(10,{from : ownerAccount}).then(function(Tx2) {
                        return instance.checkStatus.call({from : ownerAccount}).then(function(details) {
                          return assert.equal(details[5].valueOf(),10);
                          //  return instance.requestArbitration.sendTransaction(userAccount,{from : userAccount}).then(function(Tx3) {
                            });
                          });
                        });
                      });
                    });


});
