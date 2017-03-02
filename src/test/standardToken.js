var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");


contract('StandardToken', function(accounts) {
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

it("should set up contracts", function() {
    var us = User.new().then(function(userC) {
        userContract = userC.address;
        console.log("User contract is " + userContract);

    });
});



it("should get affiliate information ", function() {
    User.deployed().then(function(userInstance) {
        userInstance.createCoinOwner.
        sendTransaction(userAccount, affiliateAccount, affiliateCompany,
            "John", "{address : A}", {
                from: userAccount
            }).then(function(Tx1) {
            return userInstance.setAffiliate.sendTransaction(affiliateAccount, {
                from: userAccount
            }).then(function(Tx2) {
                return userInstance.setAffiliateCompany.sendTransaction(affiliateCompany, {
                    from: userAccount
                }).then(function(Tx3) {
                    return StandardToken.deployed().then(function(instance) {
                        return instance.resetUser.sendTransaction(userInstance.address).then(function(Tx4) {
                            // now look for user information
                            return instance.getAffiliateInfo.call(userAccount).then(function(details) {
                                console.log("Details 1 are " + details[0]);
                                console.log("Details 2 are " + details[1]);
                                assert.equal(details[0], affiliateAccount);
                                return assert.equal(details[1], affiliateCompany);
                            });
                        });
                    });
                });
            });
        });
    });
});


it("should set a price", function() {

    return StandardToken.deployed().then(function(instance) {
        // return setUpTokenData().then(function(tokenDataAddress) {
        //     console.log("token data address is " + tokenDataAddress);
        //     return instance.resetTokenData.sendTransaction(tokenDataAddress).then(function(Tx1) {
        // set a price
        return instance.setPrice.sendTransaction(false, 13, {
            from: ozCoinAccount
        }).then(function(Tx2) {
            return instance.setPrice.sendTransaction(true, 14, {
                from: ozCoinAccount
            }).then(function(Tx3) {
                return instance.getPrices.call(ozCoinAccount, {
                    from: ozCoinAccount
                }).then(function(price) {
                    // console.log(price[0].valueOf());
                    // console.log(price[1].valueOf());
                    assert.equal(price[0].valueOf(), 14);
                    assert.equal(price[1].valueOf(), 13);
                });
            });
        });
    });
});
//     });
// });


it("should test ozcoin setup", function() {
    return StandardToken.deployed().then(function(instance) {
        return setUpTokenData(instance.address, instance.address).then(function(tokenData) {
            return tokenData.getOzCoinAccount.call().then(function(oz) {
                console.log("oz is" + oz);
                return instance.resetTokenData.sendTransaction(tokenData.address, {
                    from: controller
                }).then(function(Tx1) {
                    return tokenData.checkStatus.call().then(function(status) {
                        console.log(status);
                        return instance.getOzAccount.call().then(function(ozAccount) {
                          assert.equal(ozAccount,ozCoinAccount);
                        });
                    });
                });
            });
        });
    });
});



it("should buy coins", function() {
    return StandardToken.deployed().then(function(instance) {
        return setUpTokenData(instance.address, instance.address).then(function(tokenData) {
            return instance.resetTokenData.sendTransaction(tokenData.address, {
                from: controller
            }).then(function(Tx1) {
                User.deployed().then(function(userInstance) {
                    return instance.resetUser.sendTransaction(userInstance.address).then(function(Tx2) {
                        return instance.totalSupply.call().then(function(balance0) {
                            assert.equal(balance0.valueOf(), initialSupply);
                            // set a price
                            return instance.setPrice.sendTransaction(false, 1, {
                                from: ozCoinAccount
                            }).then(function(Tx4) {
                                // now buy some coins
                                return instance.buyCoins.sendTransaction(100, ozCoinAccount, {
                                    from: userAccount,
                                    value: web3.toWei(1, "ether")
                                }).then(function(Tx5) {
                                    return instance.balanceOf.call(userAccount, {
                                        from: userAccount
                                    }).then(function(balance1) {

                                        // will have lost 4% fee
                                        assert.equal(balance1.valueOf(), 96);
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


it("should buy coins and pay affiliate ", function() {
    var ozStart = web3.eth.getBalance(ozCoinAccount);
    var userStart = web3.eth.getBalance(userAccount);
    //console.log("userStart is " + userStart);
    return StandardToken.deployed().then(function(instance) {
        return setUpTokenData(instance.address, instance.address).then(function(tokenData) {
            return instance.resetTokenData.sendTransaction(tokenData.address, {
                from: controller
            }).then(function(Tx1) {
                return instance.setAffiliatePercent.sendTransaction(5, {
                    from: controller
                }).then(function(Tx1) {
                    return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {

                        assert.equal(balanceDetails.toNumber(), initialSupply);
                        return instance.balanceOf.call(userAccount).then(function(balanceDetails2) {
                            assert.equal(balanceDetails2.toNumber(), 0);
                            // now buy some coins
                            return instance.buyCoins.sendTransaction(100, ozCoinAccount, {
                                from: userAccount,
                                value: web3.toWei(500, "finney"),
                                gas: 2000000
                            }).then(function(Tx2) {
                                var ozChange = web3.fromWei(web3.eth.getBalance(ozCoinAccount) - ozStart, "finney");
                                var userChange = web3.fromWei(web3.eth.getBalance(userAccount) - userStart, "finney");
                                return instance.getAffiliateBalance.call(affiliateAccount).then(function(affiliateBalance) {
                                    return instance.getAffiliateBalance.call(affiliateCompany).then(function(companyBalance) {
                                        var affiliateChange = web3.fromWei(affiliateBalance, "finney");
                                        var companyChange = web3.fromWei(companyBalance, "finney");
                                        console.log("oz change is " + ozChange);
                                        console.log("user change is " + userChange);
                                        console.log("affiliate change is " + affiliateChange);
                                        console.log("company change is " + companyChange);
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

it("affiliate should get paid and withdraw ether", function() {
var userStart = web3.eth.getBalance(userAccount);
var affiliateStart = web3.eth.getBalance(affiliateAccount);
var initialSupply = 200000000;
return StandardToken.deployed().then(function(instance) {
    return setUpTokenData(instance.address, instance.address).then(function(tokenData) {
        return instance.resetTokenData.sendTransaction(tokenData.address, {
            from: controller
        }).then(function(Tx1) {
            return instance.balanceOf.call(userAccount).then(function(balanceDetails2) {
                assert.equal(balanceDetails2.toNumber(), 0);
                // now buy some coins
                return instance.buyCoins.sendTransaction(100, ozCoinAccount, {
                    from: userAccount,
                    value: web3.toWei(500, "finney"),
                    gas: 2000000
                }).then(function(Tx2) {
                    return instance.withdrawEther.sendTransaction({
                        from: affiliateAccount,
                    }).then(function(Tx3) {
                        var affiliateEnd = web3.eth.getBalance(affiliateAccount);
                        return console.log("affiliate change " + (affiliateEnd - affiliateStart));

                    });
                });
            });
        });
    });
});
});


it("should test ozcoin setup for the Exchange contract", function() {
    return ExchangeToken.deployed().then(function(instance) {
      return StandardToken.deployed().then(function(walletInstance) {
        return setUpTokenData(walletInstance.address, instance.address).then(function(tokenData) {
            return tokenData.getOzCoinAccount.call().then(function(oz) {
                console.log("oz is" + oz);
                return instance.resetTokenData.sendTransaction(tokenData.address, {
                    from: controller
                }).then(function(Tx1) {
                    return tokenData.checkStatus.call().then(function(status) {
                        console.log(status);
                        return instance.getOzAccount.call().then(function(ozAccount) {
                            assert.equal(ozAccount,ozCoinAccount);
                        });
                    });
                });
            });
        });
    });
});



});


it("should transfer coins from Exchange Token", function() {
    return Exchange.deployed().then(function(instance) {
        return setUpTokenData(instance.address, instance.address).then(function(tokenData) {
            return instance.resetTokenData.sendTransaction(tokenData.address, {
                from: controller
            }).then(function(Tx1) {
                User.deployed().then(function(userInstance) {
                    return instance.resetUser.sendTransaction(userInstance.address).then(function(Tx2) {
                        return instance.totalSupply.call().then(function(balance0) {
                            assert.equal(balance0.valueOf(), initialSupply);
                            // set a price
                            return instance.setPrice.sendTransaction(false, 1, {
                                from: ozCoinAccount
                            }).then(function(Tx4) {
                                // now buy some coins
                                return instance.buyCoins.sendTransaction(100, ozCoinAccount, {
                                    from: userAccount,
                                    value: web3.toWei(1, "ether")
                                }).then(function(Tx5) {
                                    return instance.balanceOf.call(userAccount, {
                                        from: userAccount
                                    }).then(function(balance1) {

                                        // will have lost 4% fee
                                        assert.equal(balance1.valueOf(), 96);
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
