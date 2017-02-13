import {Mongo} from 'meteor/mongo';

export const Documents = new Mongo.Collection('documents');

Documents.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        return true;
    },
    remove: function (userId, doc) {
        return true;
    },
});
