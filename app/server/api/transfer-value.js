import BigNumber from "bignumber.js";
import {ether, createRawValueTx} from "./ethereum";

Meteor.methods({
    'transfer-eth': function (recipient, amount) {
        return createRawValueTx(this.userId, recipient, new BigNumber(amount).times(ether));
    },

    'transfer-ozc': function (recipient, amount) {

    },
});