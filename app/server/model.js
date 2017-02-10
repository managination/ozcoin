import {Profiles} from '../imports/api/profiles.js';

Meteor.startup (() => {
});

Meteor.publish("profiles", () => {
    return Profiles.find({owner: this.userId});
});

Meteor.publish("user-profile", (email) => {
    return Profiles.find({email: email});
});