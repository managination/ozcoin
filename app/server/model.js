import {Profiles, Roles} from "../imports/api/model/profiles";
import {Contracts} from "../imports/api/model/contracts";
import {Documents} from "../imports/api/model/documents";
import {add0x} from "../imports/api/ethereum-services";

Meteor.startup (() => {
});

Meteor.publish("current-profile", function () {
    return Profiles.find({owner: this.userId});
});

Meteor.publish("user-profile", function (address) {
    let profile = Profiles.findOne({owner: this.userId});
    if (profile.role == Roles.administrator)
        return Profiles.find({address: add0x(address)});
    return Profiles.find({address: "unauthorized"});
});

Meteor.publish("contracts", function () {
    return Contracts.find({});
});

Meteor.publish("documents", function () {
    return Documents.find({});
});

