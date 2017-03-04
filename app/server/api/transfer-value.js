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

    'buy-ozc': function (sourceAccount, amount, price) {
        let priceInWei = new BigNumber(amount).times(price).times(ether).times(2).toNumber();
        let amountInUCoins = new BigNumber(amount).times(ozcoin).toNumber();
        console.log("buying OZC from", sourceAccount, amountInUCoins, "for", new BigNumber(priceInWei).dividedBy(ether).toNumber());
        return createRawTx(this.userId, 'StandardToken', 'buyCoins', priceInWei, sourceAccount, amountInUCoins);
    },

    'redeem-affiliate-share': function () {
        return createRawTx(this.userId, 'StandardToken', 'withdrawEther', 0)
    }
});