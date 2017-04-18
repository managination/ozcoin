var contracts = require("../../app/private/development.json");
module.exports = function (callback) {
    console.log(web3.eth.accounts[0]);
    let tdi = web3.eth.contract(contracts.TokenData.abi).at(contracts.TokenData.address);
    let user = web3.eth.contract(contracts.User.abi).at(contracts.User.address);
    var ozCoinAcc = tdi.getOzCoinAccount();
    let affiliate = "0x587bb4077fbea7401b85634e341941e081f7cd4d";
    console.log("user", affiliate);
    console.log("role", user.findUserRole(affiliate));
    console.log("affiliate", user.getAffiliate(affiliate));
    console.log("affiliate company", user.getAffiliateCompany(affiliate));
    callback();
};