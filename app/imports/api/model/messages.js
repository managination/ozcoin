import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";

export const Messages = new Mongo.Collection('messages');

Messages.allow({
    update: function (userId, doc, fields, modifier) {
        return doc.address == '0x' + Meteor.user().username && fields.fieldNames.length == 1 && fields.fieldNames[0] == 'shown';
    }
});

Messages.deny({
    insert: function (userId, doc) {
        return !Meteor.isServer;
    },
    update: function (userId, doc, fields, modifier) {
        return false;
    },
    remove: function (userId, doc) {
        return !Meteor.isServer;
    }
});