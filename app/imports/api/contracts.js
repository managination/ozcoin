import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const Contracts = new Mongo.Collection('eth-contracts');

Profiles.deny({
    insert: function (userId, doc) {
        return !Meteor.isServer;
    },
    update: function (userId, doc, fields, modifier) {
        return !Meteor.isServer;
    },
    remove: function (userId, doc) {
        return !Meteor.isServer;
    }
});