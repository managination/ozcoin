var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");
var NameRegistry = artifacts.require("./NameRegistry.sol");


contract('ExchangeToken', function(accounts) {
    var userContract;
    var tokenData
    var controller = accounts[0];
    var ozCoinAccount = accounts[1];


    it("should initialise ExchangeToken and check initial supply", function() {
        return ExchangeToken.deployed().then(function(instance) {
            return TokenData.new(100, instance.address,instance.address, ozCoinAccount).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                    return instance.balanceOf.call(ozCoinAccount, {
                        from: controller,
                        gas: 2000000
                    }).then(function(balanceDetails) {
                        return assert.equal(balanceDetails.toNumber(), 100);
                    });
                });
            });
        });
    });

    it("should set and check fee rate", function() {
        return ExchangeToken.deployed().then(function(instance) {
            return TokenData.new(100, instance.address, instance.address,ozCoinAccount).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                    return tdInstance.setFeeRate.sendTransaction(10).then(function(Tx3) {
                        return tdInstance.getFeeRate.call().then(function(rate) {
                            return assert.equal(rate.toNumber(), 10);
                        });
                    });
                });
            });
        });
    });



    it("should check ozcoin balance then transfer coins ", function() {
        ExchangeToken.deployed().then(function(instance) {
            return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {
                assert.equal(balanceDetails.toNumber(), 100);
                return instance.transfer.sendTransaction(accounts[3], 20, {from: ozCoinAccount,gas: 2000000}).then(function(Tx) {
                    return instance.balanceOf.call(accounts[3]).then(function(balanceDetails1) {
                        assert.equal(balanceDetails1.toNumber(), 10);
                        return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetailsOz) {
                            assert.equal(balanceDetailsOz.toNumber(), 90);
                        });
                    });
                });
            });
        });
    });





    it("should fail to transfer coins because of insufficient balance", function() {
        ExchangeToken.deployed().then(function(instance) {
          return TokenData.new(100, instance.address,instance.address, ozCoinAccount).then(function(tdInstance) {
              return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx2) {
                return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {
                  assert.equal(balanceDetails.toNumber(), 100);
                  return instance.transfer.sendTransaction(accounts[3], 200).then(function(Tx3) {
                    return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails1) {
                         assert.equal(balanceDetails.toNumber(), 100);
                          return instance.balanceOf.call(accounts[3]).then(function(balanceDetails2) {
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
