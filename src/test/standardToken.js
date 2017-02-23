var TokenData = artifacts.require("./TokenData.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var User = artifacts.require("./User.sol");


contract('StandardToken', function(accounts) {
    var tokenDataAddress;
    var userContract;
    var controller = accounts[0];
    var ozCoinAccount = accounts[1];
    var userAccount = accounts[2];
    var affiliateAccount = accounts[3];
    var affiliateCompany = accounts[4];


    it("should set up contracts", function() {
        var us = User.new().then(function(userC) {
            userContract = userC.address;
            return console.log("User contract is " + userContract);

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
                           console.log("Details 1 are " + details[0] );
                           console.log("Details 2 are " + details[1] );
                          assert.equal(details[0],affiliateAccount);
                          return assert.equal(details[1],affiliateCompany);
                        });
                        });
                    });
                    });
                });
            });
        });
    });


      it("should set a price", function() {
        var initialSupply = 200000000;
        return StandardToken.deployed().then(function(instance) {
            return TokenData.new(initialSupply, instance.address, instance.address,ozCoinAccount).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx1) {
                  // set a price
                  return instance.setPrice.sendTransaction(false,13,{from: ozCoinAccount}).then(function(Tx2) {
                    return instance.setPrice.sendTransaction(true,14,{from: ozCoinAccount}).then(function(Tx3) {
                      return instance.getPrices.call(ozCoinAccount,{from: ozCoinAccount}).then(function(price) {
                          // console.log(price[0].valueOf());
                          // console.log(price[1].valueOf());
                          assert.equal(price[0].valueOf(), 14);
                          assert.equal(price[1].valueOf(), 13);
                      });
                   });
                   });
               });
          });
      });
});


    it("should buy coins", function() {
      var initialSupply = 200000000;
      return StandardToken.deployed().then(function(instance) {
          return TokenData.new(initialSupply, instance.address, instance.address,ozCoinAccount).then(function(tdInstance) {
              return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx1) {
                // set a price
                return instance.setPrice.sendTransaction(false,1,{from: ozCoinAccount}).then(function(Tx2) {
                    // now buy some coins
                     return instance.buyCoins.sendTransaction(100,ozCoinAccount,{from: userAccount, value: web3.toWei(20,"finney"), gas: 2000000 }).then(function(Tx3) {
                       return instance.balanceOf.call(userAccount,{from: userAccount}).then(function(balance1) {
                         console.log("User balance is " + balance1.valueOf());
                         assert.equal(balance1.valueOf(), 100);
                        });
                     });
                  });
              });
          });
      });
  });



      it("should buy coins and pay affiliate ", function() {
        var ozStart  = web3.eth.getBalance(ozCoinAccount);
        var userStart  = web3.eth.getBalance(userAccount);
        var initialSupply = 200000000;
        //console.log("userStart is " + userStart);
        return StandardToken.deployed().then(function(instance) {
            return TokenData.new(initialSupply, instance.address, instance.address,ozCoinAccount).then(function(tdInstance) {
                return instance.resetTokenData.sendTransaction(tdInstance.address).then(function(Tx1) {
                   return instance.balanceOf.call(ozCoinAccount).then(function(balanceDetails) {
                     assert.equal(balanceDetails.toNumber(), initialSupply);
                    return instance.balanceOf.call(userAccount).then(function(balanceDetails2) {
                      assert.equal(balanceDetails2.toNumber(), 0);
                        // now buy some coins
                       return instance.buyCoins.sendTransaction(100,ozCoinAccount,{from: userAccount, value: web3.toWei(500,"finney"), gas: 2000000 }).then(function(Tx2) {
                         var ozChange = web3.fromWei(web3.eth.getBalance(ozCoinAccount) - ozStart,"finney");
                          var userChange = web3.fromWei(web3.eth.getBalance(userAccount) - userStart,"finney");
                          instance.getAffiliateBalance.call({from: affiliateAccount}).then(function(affiliateBalance) {
                            instance.getAffiliateBalance.call({from: affiliateCompany}).then(function(companyBalance) {
                           var affiliateChange = web3.fromWei(affiliateBalance,"finney");
                           var companyChange = web3.fromWei(companyBalance,"finney");
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
