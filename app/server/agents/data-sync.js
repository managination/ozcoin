import {Meteor} from "meteor/meteor";
import {HTTP} from "meteor/http";
import {EJSON} from "meteor/ejson";
import BigNumber from "bignumber.js";
import {getWeb3, add0x, isValidAddress, ether, ozcoin} from "../../imports/api/ethereum-services";
import {callContractMethod, listenToEvent} from "../../imports/api/contracts/ethereum-contracts";
import {Profiles} from "../../imports/api/model/profiles";
import {Globals} from "../../imports/api/model/globals";
import {Messages} from "../../imports/api/model/messages";

let updatingUser = false;
let updatingBalance = false;
let updatingEthPrice = false;

function checkRegistration(profile, role) {
    let profileToUpdate = {update: false};
    if (role.comparedTo(profile.role) != 0) {
        profileToUpdate.role = role.toNumber();
        profileToUpdate.update = true;
    }

    if (!profile.isRegistered) {
        console.log("registering", result[0]);
        profileToUpdate.isRegistered = true;
        profileToUpdate.update = true;
    }

    return profileToUpdate;
}

Meteor.startup(() => { //Wallet events
    listenToEvent('ExchangeToken', 'Transfer', null, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._from}, {$inc: {ozcBalance: result.args._value.negated().toNumber()}});
        Profiles.update({address: result.args._to}, {$inc: {ozcBalance: result.args._value.toNumber()}})
    }));

    listenToEvent('StandardToken', 'Transfer', null, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._from}, {$inc: {ozcBalance: result.args._value.negated().toNumber()}});
        Profiles.update({address: result.args._to}, {$inc: {ozcBalance: result.args._value.toNumber()}})
    }));

    listenToEvent('StandardToken', 'PriceSet', null, Meteor.bindEnvironment((result) => {
        setOzcPrices(result.args.seller,
            result.args.side ? result.args.price.toNumber() : -1,
            !result.args.side ? result.args.price.toNumber() : -1);
    }));

    listenToEvent('StandardToken', 'AffiliatePaid', null, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._affiliate}, {$inc: {ozcBalance: result.args._amount.toNumber()}})
    }));

    listenToEvent('StandardToken', 'TransactionFeeChanged', null, Meteor.bindEnvironment((result) => {
        Globals.update({name: "transactionFee"}, {$set: {fee: result.args._newRate.toNumber()}});
    }));

    listenToEvent('StandardToken', 'InsufficientFunds', null, Meteor.bindEnvironment((result) => {
        Messages.insert({
            address: result._account, severity: "ERROR",
            message: "insufficient ETH for purchase " +
            "offered: " + result._offered.toString() + " required: " + result._required.toString()
        });
    }));

});

Meteor.startup(() => { //User events
    listenToEvent('User', 'UserRoleChanged', {}, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._account}, {
            $set: {
                role: result.args._newRole.toNumber()
            }
        })
    }));
    listenToEvent('User', 'UserDeactivated', {}, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._account}, {$set: {status: "inactive"}})
    }));
    listenToEvent('User', 'UserReactivated', {}, Meteor.bindEnvironment((result) => {
        Profiles.update({address: result.args._account}, {$set: {status: "active"}})
    }));
});

Meteor.startup(() => {
    getEthereumPrice();

    Meteor.setInterval(() => {
        if (!updatingBalance) {
            updatingBalance = true;
            Meteor.users.find({"status.online": true}).forEach((user) => {
                updateProfileEthBalance(Profiles.findOne({owner: user._id}));
            });
            updatingBalance = false;
        }
    }, Meteor.settings.userBalancePollInterval);
    Meteor.setInterval(() => {
        getEthereumPrice();
    }, Meteor.settings.ethPricePollInterval);
});

Meteor.methods({
    'store-salt': function (mnemonicHash, salt) {
        Profiles.update({owner: this.userId}, {$set: {mnemonicHash: mnemonicHash, salt: salt}});
    },
    'get-salt-from-mnemonic': function (mnemonicHash) {
        let profile = Profiles.findOne({mnemonicHash: mnemonicHash});
        return profile ? profile.salt : null;
    },
    'update-balance': function () {
        let profile = Profiles.findOne({owner: this.userId});
        updateProfileEthBalance(profile);
        updateProfileOzcBalance(profile);
    },
    'update-user-details': function () {
        let profile = Profiles.findOne({owner: this.userId});
        updateUserDetails(profile);
        updateProfileEthBalance(profile);
        updateProfileOzcBalance(profile);
    }
});

const setOzcPrices = function (address, sell, buy) {
    if (sell) {
        Profiles.update({address: address}, {$set: {"price.sell": sell}});
        if (address == Globals.findOne({name: 'ozcoin-account'}).address) {
            getEthereumPrice();
        }
    }
    if (buy)
        Profiles.update({address: address}, {$set: {"price.buy": buy}})

};

const getEthereumPrice = function () {
    HTTP.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR", (error, response) => {
        if (!response) return;

        let prices = EJSON.parse(response.content);
        Globals.upsert({name: "ethPrice"}, {$set: prices});

        /**now we have to reset the OZC value because the ETH value has changed*/
        let ozcAddress = Globals.findOne({name: 'ozcoin-account'}).address;
        callContractMethod('StandardToken', 'getPrices', ozcAddress)
            .then((ozcPrices) => {
                setOzcPrices(ozcAddress, ozcPrices[0].toNumber(), ozcPrices[1].toNumber());
                prices.ETH = new BigNumber(ozcPrices[0]).dividedBy(ether).times(ozcoin).toNumber();

                /**converting OZC to ETH and adapting the price*/
                prices.USD = prices.USD * prices.ETH;
                prices.EUR = prices.EUR * prices.ETH;
                prices.BTC = prices.BTC * prices.ETH;
                Globals.upsert({name: "ozcPrice"}, {$set: prices});
            });
    });
};

export const updateProfileEthBalance = function (profile) {
    if (!profile || !profile.address || !isValidAddress(profile.address)) return;

    let balance = getWeb3().eth.getBalance(add0x(profile.address));
    if (balance.dividedBy(ether).comparedTo(profile.balance) != 0) {
        console.log("updating balance of", profile.address, "from", profile.balance.toString(10), "to", balance.toString(10));
        Profiles.update({_id: profile._id}, {$set: {balance: balance.toString(16)}});
    }
};

const updateProfileOzcBalance = function (profile) {
    if (!profile || !profile.address || !isValidAddress(profile.address)) return;

    callContractMethod('ExchangeToken', 'balanceOf', profile.address).then((balance) => {
        if (balance.comparedTo(profile.ozcBalance) != 0) {
            Profiles.update({_id: profile._id}, {$set: {ozcBalance: balance.toNumber()}});
        }
    })
};

const updateUserDetails = function (profile) {
    if (!profile || !profile.address || !isValidAddress(profile.address)) return;

    return callContractMethod('User', 'checkRegistration', profile.address).then((result) => {
        let isRegistered = result[0];
        let role = result[1];
        Profiles.update({_id: profile._id}, {$set: {isRegistered: isRegistered, role: role.toNumber()}});
        if (isRegistered) {
            callContractMethod('User', 'getUserDetails', profile.address).then((result) => {
                let name = result[0];
                let details = result[2];
                if (typeof details == 'string' && details.length > 3) {
                    details = EJSON.parse(details);
                } else {
                    details = undefined;
                }

                Profiles.update({_id: profile._id}, {$set: {name: name, role: role.toNumber()}});
            });
        }
    })
};