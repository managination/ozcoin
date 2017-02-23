import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";

export const Transfers = new Mongo.Collection('transfers');

Transfers.deny({
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