import BigNumber from "bignumber.js";
import {ozcoin, ether, createRawValueTx, createRawTx} from "./ethereum";

Meteor.methods({
    'transfer-eth': function (recipient, amount) {
        return createRawValueTx(this.userId, recipient,
            new BigNumber(amount).times(ether).toNumber());
    },

    'transfer-ozc': function (recipient, amount) {
        return createRawTx(this.userId, 'ExchangeToken', 'transfer', 0, recipient,
            new BigNumber(amount).times(ozcoin).toNumber());
    },
});