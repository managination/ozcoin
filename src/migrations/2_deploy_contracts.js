var User = artifacts.require("./User.sol");
var BaseContract = artifacts.require("./BaseContract.sol");
var Certificate = artifacts.require("./Certificate.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var TokenData = artifacts.require("./TokenData.sol");


;
module.exports = function(deployer) {
var controller = "0xac0c340fb273f9055a154605fa2a3a195d708a11";
var ozCoinAccount = "0x1b58d0a99b7aff8e0b41ac49129ae77908c46801";
var userAccount = "0x9ac78264683ed7369fb16835743e9866322bccbd";
var affiliateAccount = "0x36a961037b61af0e4735592882fe6d2b5b4917ce";
var affiliateCompany = "0x870655d52d5cca59cf9533db16dedda5119ed3b7";
var tdInst;
var stInst;
deployer.deploy(User);
deployer.deploy(BaseContract);
deployer.deploy(Certificate);
deployer.deploy(ExchangeToken);
//  deployer.deploy(StandardToken);

deployer.then(function() {
    return StandardToken.new();
}).then(function(sTinstance) {
    return stInst = sTinstance;
}).then(function() {
    console.log("Standard Token at " + stInst.address);
    return TokenData.new(490000000000000, ozCoinAccount, "0x0");
}).then(function(instance) {
    console.log("Token Data at " + instance.address);
    tdInst = instance;
    return tdInst.setContractAdminOnly.sendTransaction().then(function(Tx1) {
        console.log("about to set controllers");
        return tdInst.setWalletController.sendTransaction(stInst.address).then(function(Tx1) {
            return tdInst.setExchangeController.sendTransaction(ExchangeToken.address).then(function(Tx2) {
                return tdInst.setArbitrationAccount.sendTransaction(controller).then(function(Tx3) {
                    console.log("controllers set");
                    return tdInst.activateContract.sendTransaction().then(function(Tx4) {
                        console.log("contract activated");
                        return stInst.resetTokenData.sendTransaction(tdInst.address).then(function(Tx5) {
                            return stInst.resetUser.sendTransaction(User.address);

                      });
                      });

                    });
                });
            });
        });
    });
};
