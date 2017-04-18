var contracts = require("../../app/private/development.json");
module.exports = function (callback) {
    let tdi = web3.eth.contract(contracts.TokenData.abi).at(contracts.TokenData.address);
    let user = web3.eth.contract(contracts.User.abi).at(contracts.User.address);
    var ozCoinAcc = tdi.getOzCoinAccount();
    let admin = "0x77454e832261aeed81422348efee52d5bd3a3684";//web3.eth.accounts[9];
    let addr = "0x587bb4077fbea7401b85634e341941e081f7cd4d";
    user.setRole(admin, 1, {from: ozCoinAcc});
    console.log("admin is", admin, user.findUserRole(admin));

    /*
     user.setRole(addr, 8, {from: admin});
     console.log("account is", addr, user.findUserRole(addr));
     user.updateUserDetails(addr, "name", "details", addr, addr, {from: admin});
     console.log("role", user.findUserRole(addr));
     console.log("affiliate", user.getAffiliate(addr));
     console.log("affiliate company", user.getAffiliateCompany(addr));
     */
    callback();
};