import {Meteor} from "meteor/meteor";
import {HTTP} from "meteor/http";
import {EJSON} from "meteor/ejson";
import BigNumber from "bignumber.js";
import {add0x, ether, getWeb3, isValidAddress, ozcoin} from "../../imports/ethereum/ethereum-services";
import {callContractMethod, Events, listenToEvent} from "../../imports/api/contracts/ethereum-contracts";
import {createRawTx} from "../api/ethereum";
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

if (Meteor.settings.listeners) {
    Meteor.methods({
        'transfer-event': function (result) {
            console.log('ExchangeToken', 'Transfer', result);
            Profiles.update({address: result.args._from}, {$inc: {ozcBalance: (result.args._value * -1)}});
            Profiles.update({address: result.args._to}, {$inc: {ozcBalance: result.args._value}})
        },
        'set-price': function (result) {
            setOzcPrices(result.args.seller,
                result.args.side ? result.args.price : -1,
                !result.args.side ? result.args.price : -1);
        },
        'affiliate-paid': function (result) {
            Profiles.update({address: result.args._affiliate}, {$inc: {affiliateBalance: result.args._amount}})
        },
        'set-transaction-fee': function (result) {
            Globals.upsert({name: "transaction-fee"}, {$set: {value: result.args._newRate / 10000}});
        },
        'insufficient-funds': function (result) {
            Messages.insert({
                address: result._account, severity: "ERROR",
                message: "insufficient ETH for purchase " +
                "offered: " + result._offered + " required: " + result._required
            });
        },
        'ether-withdrawn': function (result) {
            let profile = Profiles.findOne({address: result._account});
            if (profile) {
                updateProfileEthBalance(profile);
                updateProfileAffiliateBalane(profile);
            }
        }
    });
    Meteor.startup(() => { //Wallet events
        listenToEvent('ExchangeToken', 'Transfer', null, 'transfer-event');
        listenToEvent('StandardToken', 'Transfer', null, 'transfer-event');
        listenToEvent('StandardToken', 'PriceSet', null, 'set-price');
        listenToEvent('StandardToken', 'AffiliatePaid', null, 'affiliate-paid');
        listenToEvent('StandardToken', 'TransactionFeeChanged', null, 'set-transaction-fee');
        listenToEvent('StandardToken', 'InsufficientFunds', null, 'insufficient-funds');
        listenToEvent('StandardToken', 'EtherWithdrawn', null, 'ether-withdrawn');
    });

    Meteor.methods({
        'set-user-role': function (result) {
            Profiles.update({address: result.args._account}, {
                $set: {
                    isRegistered: true,
                    role: result.args._newRole || result.args._role
                }
            })
        },
        'deactivate-user': function (result) {
            Profiles.update({address: result.args._account}, {$set: {status: "inactive"}})
        },
        'reactivate-user': function (result) {
            Profiles.update({address: result.args._account}, {$set: {status: "active"}})
        }
    });
    Meteor.startup(() => { //User events
        listenToEvent('User', 'UserAdded', {}, 'set-user-role');
        listenToEvent('User', 'UserRoleChanged', {}, 'set-user-role');
        listenToEvent('User', 'UserDeactivated', {}, 'deactivate-user');
        listenToEvent('User', 'UserReactivated', {}, 'reactivate-user');
    });

    Events.find({executed: false}).observe({
        added: function (event) {
            Events.update({_id: event._id}, {$set: {executed: true}}, {
                multi: false,
                upsert: false
            }, function (err, count) {
                Meteor.call(event.method, event.result);
            })
        }
    })
}

if (Meteor.settings.polling) {
    Meteor.startup(() => {
        SyncedCron.config({
            // Log job run details to console
            log: true,

            // Use a custom logger function (defaults to Meteor's logging package)
            logger: null,

            // Name of collection to use for synchronisation and logging
            collectionName: 'cronHistory',

            // Default to using localTime
            utc: false,

            /*
             TTL in seconds for history records in collection to expire
             NOTE: Unset to remove expiry but ensure you remove the index from
             mongo by hand

             ALSO: SyncedCron can't use the `_ensureIndex` command to modify
             the TTL index. The best way to modify the default value of
             `collectionTTL` is to remove the index by hand (in the mongo shell
             run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
             project. SyncedCron will recreate the index with the updated TTL.
             */
            collectionTTL: 172800
        });

        SyncedCron.add({
            name: 'Update the ETH and OCZ balances for logged in users',
            schedule: function (parser) {
                // parser is a later.parse object
                return parser.text('every 1 min');
            },
            job: function () {
                Meteor.users.find({"status.online": true}).forEach((user) => {
                    console.log("updating balances for", user.username);
                    updateProfileEthBalance(Profiles.findOne({owner: user._id}));
                });
                return true;
            }
        });
        SyncedCron.add({
            name: 'Update the ETH and OCZ price',
            schedule: function (parser) {
                // parser is a later.parse object
                return parser.text('every 1 min');
            },
            job: function () {
                console.log("sync prices in batch job");
                getEthereumPrice();
                return true;
            }
        });

        SyncedCron.start()
    })
}

Meteor.startup(() => {
    console.log("sync prices in startup");
    getEthereumPrice();
    callContractMethod('StandardToken', 'getFeePercent').then((fee) => {
        Meteor.call('set-transaction-fee', {args: {_newRate: fee.toNumber()}})
    })
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
        console.log("manual balance update for", profile.address);
        updateProfileEthBalance(profile);
        updateProfileOzcBalance(profile);
        updateProfileAffiliateBalane(profile);
    },
    'sync-user-details': function () {
        let profile = Profiles.findOne({owner: this.userId});
        if(!profile.userNum){
            let userNum = Globals.findOne({name: "user-count"}).value + 1;
            Profiles.update({_id: profile._id}, {$set: {userNum: userNum}});
            Globals.update({name: "user-count"}, {$inc: {value: 1}});
        }
        updateUserDetails(profile);
        updateProfileEthBalance(profile);
        updateProfileOzcBalance(profile);
        updateProfileAffiliateBalane(profile);
    },
    'change-user-role': function (address, role) {
        return createRawTx(this.userId, "User", "changeRole", 0, address, role)
    }
});

const setOzcPrices = function (address, sell, buy) {
    if (sell) {
        Profiles.update({address: address}, {$set: {"price.sell": sell}});
    }
    if (buy)
        Profiles.update({address: address}, {$set: {"price.buy": buy}})

};

const getEthereumPrice = function () {
    HTTP.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR", (error, response) => {
        if (!response) return;

        let prices = EJSON.parse(response.content);
        Globals.upsert({name: "ethPrice"}, {$set: prices});

        /**now we have to reset the OzGLD value because the ETH value has changed*/
        callContractMethod('StandardToken', 'getOzAccount').then((ozcAddress) => {
            callContractMethod('StandardToken', 'getPrices', ozcAddress)
                .then((ozcPrices) => {
                    Globals.upsert({name: 'ozcoin-account'}, {$set: {address: ozcAddress}});
                    setOzcPrices(ozcAddress, ozcPrices[0].toNumber(), ozcPrices[1].toNumber());
                    prices.ETH = new BigNumber(ozcPrices[0].toString()).dividedBy(ether).times(ozcoin).toNumber();

                    /**converting OzGLD to ETH and adapting the price*/
                    prices.USD = prices.USD * prices.ETH;
                    prices.EUR = prices.EUR * prices.ETH;
                    prices.BTC = prices.BTC * prices.ETH;
                    Globals.upsert({name: "ozcPrice"}, {$set: prices});
                    console.log("set price and ozGLD address");
                });
        })
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

const updateProfileAffiliateBalane = function (profile) {
    if (!profile || !profile.address || !isValidAddress(profile.address)) return;

    callContractMethod('StandardToken', 'getAffiliateBalance', profile.address).then((balance) => {
        if (!profile.affiliateBalance || balance.comparedTo(profile.affiliateBalance.toString()) != 0) {
            Profiles.update({_id: profile._id}, {$set: {affiliateBalance: balance.toNumber()}});
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