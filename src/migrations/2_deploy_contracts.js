var User = artifacts.require("./User.sol");
var BaseContract = artifacts.require("./BaseContract.sol");
var Certificate = artifacts.require("./Certificate.sol");
var ExchangeToken = artifacts.require("./ExchangeToken.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var TokenData = artifacts.require("./TokenData.sol");

module.exports = function (deployer) {
    var controller = web3.eth.accounts[0];
    var ozCoinAccount = web3.eth.accounts[1];
    var userAccount = web3.eth.accounts[2];
    var affiliateAccount = web3.eth.accounts[3];
    var affiliateCompany = web3.eth.accounts[4];
    var tdInst;
    var stInst;
    var contractDefs = require("../../app/private/development.json");
    var fs = require("fs");

    deployer.deploy(User);
    deployer.deploy(BaseContract);
    deployer.deploy(Certificate);
    deployer.deploy(ExchangeToken);
//  deployer.deploy(StandardToken);

    contractDefs.ozcAccount = ozCoinAccount;
    if (web3.eth.getBalance("0x77454e832261aeed81422348efee52d5bd3a3684").toNumber() < 10)
        web3.eth.sendTransaction({
            from: web3.eth.accounts[5],
            to: "0x77454e832261aeed81422348efee52d5bd3a3684",
            value: web3.toWei(99, "ether")
        });

    deployer.then(function () {
        contractDefs.Certificate.address = Certificate.address;
        contractDefs.User.address = User.address;
        contractDefs.User.abi = User.abi;
        contractDefs.ExchangeToken.address = ExchangeToken.address;
        return StandardToken.new();
    }).then(function (sTinstance) {
        contractDefs.StandardToken.address = sTinstance.address;
        return stInst = sTinstance;
    }).then(function () {
        console.log("Standard Token at " + stInst.address);
        return TokenData.new(490000000000000, ozCoinAccount, "0x0");
    }).then(function (instance) {
        contractDefs.TokenData.address = instance.address;
        fs.writeFileSync("../app/private/development.json", JSON.stringify(contractDefs));
        console.log("Token Data at " + instance.address);
        tdInst = instance;
        return tdInst.setContractAdminOnly.sendTransaction().then(function (Tx1) {
            console.log("about to set controllers");
            return tdInst.setWalletController.sendTransaction(stInst.address).then(function (Tx1) {
                return tdInst.setExchangeController.sendTransaction(ExchangeToken.address).then(function (Tx2) {
                    return tdInst.setArbitrationAccount.sendTransaction(controller).then(function (Tx3) {
                        console.log("controllers set");
                        stInst.activateContract.sendTransaction().then(() => Tx4).then(() => {
                            stInst.setPrice(true, 12000000000000, {from: ozCoinAccount});
                            stInst.setPrice(false, 12000000000000, {from: ozCoinAccount});
                        });
                        return tdInst.activateContract.sendTransaction().then(function (Tx4) {
                            console.log("contract activated");
                            return stInst.resetTokenData.sendTransaction(tdInst.address).then(function (Tx5) {
                                return stInst.resetUser.sendTransaction(User.address);
                            });
                        });

                    });
                });
            });
        });
    });
};
