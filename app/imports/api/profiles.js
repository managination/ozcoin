import { Mongo } from 'meteor/mongo';

export const Profiles = new Mongo.Collection('profiles');

Profiles.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents unless you are an admin
        return doc.owner === userId || Profiles.find({role: Roles.administrator, address: userId}).count() > 0;
    },
    remove: function (userId, doc) {
        // can only remove your own documents unless you are an admin
        return doc.owner === userId || Profiles.find({role: Roles.administrator, address: userId}).count() > 0;
    },
    fetch: ['owner']
});

Profiles.deny({
    update: function (userId, doc, fields, modifier) {
        // can't change owners
        return _.contains(fields, 'owner');
    },
    remove: function (userId, doc) {
        // can't remove locked documents
        return doc.locked;
    },
    fetch: ['locked'] // no need to fetch 'owner'
});

export const Roles = {
    all: -1,
    administrator: 0,
    minter: 1,
    arbitrator: 2,
    certificatecreator: 3,
    coinowner: 4,
    auditor: 5,
    escrowagent: 6,
    affiliate: 7,
    affiliatecompany: 8
};