import {Meteor} from "meteor/meteor";
import {HTTP} from "meteor/http";
import {EJSON} from "meteor/ejson";
import {getWeb3, add0x, ether} from "../../imports/api/ethereum-services";
import {callContractMethod} from "../../imports/api/contracts/ethereum-contracts";
import {Profiles} from "../../imports/api/model/profiles";
import {Globals} from "../../imports/api/model/globals";

let updatingUser = false;
let updatingBalance = false;
let updatingEthPrice = false;

Meteor.startup(() => {
    Meteor.setInterval(() => {
        if (!updatingUser) {
            updatingUser = true;
            Profiles.find({}).forEach((profile) => {
                callContractMethod('User', 'getUserDetails', profile.address)
                    .then((result) => {
                        let role = result[1];
                        let profileToUpdate = {update: false};
                        if (role.comparedTo(profile.role) != 0) {
                            /*
                             profileToUpdate.role = role.toNumber();
                             profileToUpdate.update = true;
                             */
                        }
                        if (result[0] != "‌0x0000000000000000000000000000000000000000000000000000000000000000" && !profile.isRegistered) {
                            console.log("registering", result[0]);
                            profileToUpdate.isRegistered = true;
                            profileToUpdate.update = true;
                        }
                        return profileToUpdate;
                    })
                    .then((profileToUpdate) => {
                        return callContractMethod('StandardToken', 'balanceOf', profile.address).then((balance) => {
                            if (balance.comparedTo(profile.ozcBalance) != 0) {
                                profileToUpdate.update = true;
                                profileToUpdate.ozcBalance = balance.toNumber();
                            }
                            return profileToUpdate;
                        })
                    })
                    .then((profileToUpdate) => {
                        if (profileToUpdate.update) {
                            delete profileToUpdate.update;
                            Profiles.update({_id: profile._id}, {$set: profileToUpdate});
                        }
                    })
            });
            updatingUser = false;
        }
    }, Meteor.settings.userPollInterval);

    Meteor.setInterval(() => {
        if (!updatingBalance) {
            updatingBalance = true;
            HTTP.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR", (error, response) => {
                let prices = EJSON.parse(response.content);
                Globals.upsert({name: "ethPrice"}, {$set: prices});
                prices.ETH = 1200 / prices.USD / 100;

                /**converting OZC to ETH and adapting the price*/
                prices.USD = prices.USD * prices.ETH;
                prices.EUR = prices.EUR * prices.ETH;
                prices.BTC = prices.BTC * prices.ETH;
                Globals.upsert({name: "ozcPrice"}, {$set: prices});
            });
            Profiles.find({}).forEach((profile) => {
                let balance = getWeb3().eth.getBalance(add0x(profile.address));
                if (balance.dividedBy(ether).comparedTo(profile.balance) != 0) {
                    console.log("updating balance of", profile.address, "from", profile.balance.toString(10), "to", balance.toString(10));
                    Profiles.update({_id: profile._id}, {$set: {balance: balance.toString(16)}});
                }
            });
            updatingBalance = false;
        }
    }, Meteor.settings.userBalancePollInterval);
});