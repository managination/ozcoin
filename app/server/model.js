import {Profiles} from '../imports/api/model/profiles';
import {Contracts} from '../imports/api/model/contracts';

Meteor.startup (() => {
});

Meteor.publish("current-profile", function () {
    return Profiles.find({owner: this.userId});
});

Meteor.publish("user-profile", (email) => {
    return Profiles.find({email: email});
});

Meteor.publish("contracts", function () {
    return Contracts.find({});
});

