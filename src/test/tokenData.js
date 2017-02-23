var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");

contract('TokenData', function(accounts) {

    // need checks for only controller
    // need check for non active contract

    var controllerAccount = accounts[0];
    var ozAccount = accounts[1];
    var initialSupply = 100;

    it("should create a new Coin", function() {
        console.log("account 1 is " + accounts[1]);
        var td = TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return console.log("Instance Address is " + instance.address);
        });

    });

    it("should return status", function() {
        var td = TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.checkStatus.call().then(function(details) {
                    return assert.equal(details[2], controllerAccount);
                });
            });
        });

    });

    it("should have the correct balances", function() {
        TokenData.new(initialSupply, controllerAccount, controllerAccount,ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.balanceOf.call(ozAccount).then(function(balance) {
                    return assert.equal(balance.valueOf(), initialSupply);
                });
            });
        });

    });

    it("should transfer balances", function() {
        TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.transfer.sendTransaction(ozAccount, controllerAccount, 10, 0).then(function(Tx2) {
                    return instance.balanceOf.call(controllerAccount).then(function(balance) {
                        assert.equal(balance.valueOf(), 10)
                        return instance.balanceOf.call(ozAccount).then(function(balance2) {
                            return assert.equal(balance2.valueOf(), initialSupply - 10);


                        });
                    });
                });
            });
        });

    });

    it("should fail to transfer balances if insufficient funds", function() {
        TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.transfer.sendTransaction(ozAccount, controllerAccount, (initialSupply + 1), 0).then(function(Tx2) {
                    return instance.balanceOf.call(controllerAccount).then(function(balance) {
                        assert.equal(balance.valueOf(), 0)
                        return instance.balanceOf.call(ozAccount).then(function(balance2) {
                            return assert.equal(balance2.valueOf(), initialSupply);
                        });
                    });
                });
            });
        });
    });


    it("should set a buy and sell price", function() {
        TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.setPrice.sendTransaction(ozAccount,true,10).then(function(Tx2) {
                  return instance.setPrice.sendTransaction(ozAccount,false,13).then(function(Tx3) {
                    return instance.getPrices.call(ozAccount).then(function(price) {
                        assert.equal(price[0].valueOf(), 10)
                        assert.equal(price[1].valueOf(), 13)
                    });
                });
            });
        });
    });
        });




    it("should produce a pending transfer", function() {
        TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.transfer.sendTransaction(ozAccount, controllerAccount, (initialSupply - 20), 10).then(function(Tx2) {
                    return instance.balanceOf.call(controllerAccount).then(function(balance) {
                        assert.equal(balance.valueOf(), 0);
                        return instance.balanceOf.call(ozAccount).then(function(balance2) {
                            return assert.equal(balance2.valueOf(), 20);
                        });
                    });
                });
            });
        });
    });

    it("should produce a pending transfer and activate it", function() {
        TokenData.new(initialSupply, controllerAccount,controllerAccount, ozAccount).then(function(instance) {
            return instance.activateContract.sendTransaction().then(function(Tx) {
                return instance.transfer.sendTransaction(ozAccount, controllerAccount, (initialSupply - 20), 10).then(function(Tx2) {
                    return instance.getPendingTransfers.call().then(function(pends) {
                        assert.equal(pends.length, 1);
                        return instance.activatePendingTransfer.sendTransaction(0).then(function(Tx3) {
                            return instance.balanceOf.call(controllerAccount).then(function(balance) {
                                assert.equal(balance, (initialSupply - 20));
                            });
                        });
                    });
                });
            });

        });
    });
});
