var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");
var NameRegistry = artifacts.require("./NameRegistry.sol");


contract('ExchangeToken', function(accounts) {
  var userContract;
  var controller = accounts[0];
  var ozCoinAccount = accounts[1];
  var userAccount = accounts[2];
  var affiliateAccount = accounts[3];
  var affiliateCompany = accounts[4];
  var arbiter = accounts[5];
  var userAccount2 = accounts[6];
  var initialSupply = 20000000000;


    function setUpTokenData(walletController, exchangeController) {
        console.log("setting up token data");
        return TokenData.new(initialSupply, ozCoinAccount).then(function(tdInst) {
            return tdInst.setContractAdminOnly.sendTransaction().then(function(Tx1) {
                console.log("about to set controllers");
                return tdInst.setWalletController.sendTransaction(walletController).then(function(Tx1) {
                    return tdInst.setExchangeController.sendTransaction(exchangeController).then(function(Tx2) {
                      return tdInst.setArbitrationAccount.sendTransaction(arbiter).then(function(Tx3) {
                        console.log("controllers set");
                        return tdInst.activateContract.sendTransaction().then(function(Tx4) {
                            console.log("contract activated");
                            return tdInst.setFeePercent.sendTransaction(4, {
                                from: controller
                            }).then(function(Tx4) {
                                return tdInst;
                            });
                            });
                        });
                    });
                });
            });
        });
    }



    it("should initialise ExchangeToken and check initial supply", function() {
        return ExchangeToken.deployed().then(function(instance) {
          return instance.setContractAdminOnly.sendTransaction().then(function(Tx1){
            return setUpTokenData(instance.address, instance.address).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                  return instance.activateContract.sendTransaction().then(function(Tx3){
                    return instance.balanceOf.call(ozCoinAccount, {
                        from: controller,
                        gas: 2000000
                    }).then(function(balanceDetails) {
                        return assert.equal(balanceDetails.toNumber(), initialSupply);
                    });
                  });
                });
            });
        });
    });
    });

    it("should set and check fee rate", function() {
        return ExchangeToken.deployed().then(function(instance) {
          return instance.setContractAdminOnly.sendTransaction().then(function(Tx1){
            return setUpTokenData(instance.address, instance.address).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                    return instance.activateContract.sendTransaction().then(function(Tx3){
                    return instance.setFeePercent.sendTransaction(10).then(function(Tx4) {
                        return instance.getFeePercent.call().then(function(rate) {
                            return assert.equal(rate.toNumber(), 10);
                        });
                    });
                    });
                    });
                });
            });
        });
    });


    it("should check ozcoin balance then transfer coins ", function() {
        ExchangeToken.deployed().then(function(instance) {
          return instance.setContractAdminOnly.sendTransaction().then(function(Tx1){
          return setUpTokenData(instance.address, instance.address).then(function(tdInstance) {
            return instance.activateContract.sendTransaction().then(function(Tx3){
            return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {
                assert.equal(balanceDetails.toNumber(), initialSupply);
                return instance.transfer.sendTransaction(accounts[3], 100, {from: ozCoinAccount,gas: 2000000}).then(function(Tx) {
                    return instance.balanceOf.call(accounts[3]).then(function(balanceDetails1) {
                        assert.equal(balanceDetails1.toNumber(), 90);
                        return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetailsOz) {
                            assert.equal(balanceDetailsOz.toNumber(), initialSupply - 100);
                        });
                    });
                });
                });
                });
              });
            });
        });
    });





    it("should fail to transfer coins because of insufficient balance", function() {
        ExchangeToken.deployed().then(function(instance) {
            return instance.setContractAdminOnly.sendTransaction().then(function(Tx1){
          return setUpTokenData(instance.address, instance.address).then(function(tdInstance) {
              return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                return instance.activateContract.sendTransaction().then(function(Tx3){
                return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {
                  assert.equal(balanceDetails.toNumber(), initialSupply - 100);
                  return instance.transfer.sendTransaction(userAccount2, initialSupply).then(function(Tx3) {
                    return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails1) {
                         assert.equal(balanceDetails.toNumber(), initialSupply - 100);
                          return instance.balanceOf.call(userAccount2).then(function(balanceDetails2) {
                            return assert.equal(balanceDetails2.toNumber(), 0);
                        });
                          });
                    });
                });
            });
            });
            });
        });
    });
  });


});
