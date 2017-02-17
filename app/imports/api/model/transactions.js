import {Mongo} from 'meteor/mongo';

export const Transactions = new Mongo.Collection('eth-transactions');

Transactions.allow({
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
