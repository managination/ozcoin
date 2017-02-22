import {Meteor} from "meteor/meteor";
import {getWeb3, add0x, ether} from "../../imports/api/ethereum-services";
import {callContractMethod} from "../../imports/api/contracts/ethereum-contracts";
import {Profiles} from "../../imports/api/model/profiles";

let updating = false;
Meteor.startup(() => {
    Meteor.setInterval(() => {
        if (!updating) {
            updating = true;
            Profiles.find({}).forEach((profile) => {
                let balance = getWeb3().eth.getBalance(add0x(profile.address));
                let profileToUpdate = {update: false};
                if (balance.dividedBy(ether).comparedTo(profile.balance) != 0) {
                    console.log("updating balance of", profile.address, "from", profile.balance.toString(10), "to", balance.toString(10));
                    profileToUpdate.balance = balance.toString(16);
                    profileToUpdate.update = true;
                }
                callContractMethod('User', 'getUserDetails', profile.address).then((result) => {
                    let role = result[1];
                    if (role.comparedTo(profile.role) != 0) {
                        profileToUpdate.role = role;
                        profileToUpdate.update = true;
                    }
                    if (result[0] != "‌0x0000000000000000000000000000000000000000000000000000000000000000" && !profile.isRegistered) {
                        profileToUpdate.isRegistered = true;
                        profileToUpdate.update = true;
                    }
                    return profileToUpdate;
                }).then((profileToUpdate) => {
                    if (profileToUpdate.update) {
                        delete profileToUpdate.update;
                        Profiles.update({_id: profile._id}, {$set: profileToUpdate});
                    }
                })
            });
            updating = false;
        }
    }, 5000);
});