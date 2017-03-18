import BigNumber from "bignumber.js";
import {ozcoin, ether, createRawValueTx, createRawTx} from "./ethereum";

Meteor.methods({
    'transfer-eth': function (recipient, amount) {
        console.log("transferring", amount, "ETH");
        return createRawValueTx(this.userId, recipient,
            new BigNumber(amount.toString()).times(ether).toNumber());
    },

    'transfer-ozc': function (recipient, amount) {
        console.log("transferring", amount, "OZC");
        return createRawTx(this.userId, 'ExchangeToken', 'transfer', 0, recipient,
            new BigNumber(amount.toString()).times(ozcoin).toNumber());
    },

    'buy-ozc': function (sourceAccount, amount, price) {
        let priceInWei = new BigNumber(amount.toString()).times(price).times(ether) + 500;
        let amountInUCoins = new BigNumber(amount.toString()).times(ozcoin).toString();
        console.log("buying OZC from", sourceAccount, amountInUCoins, "for", new BigNumber(priceInWei).dividedBy(ether).toNumber());
        return createRawTx(this.userId, 'StandardToken', 'buyCoins', priceInWei.toNumber(), amountInUCoins, sourceAccount);
    },

    'redeem-affiliate-share': function () {
        return createRawTx(this.userId, 'StandardToken', 'withdrawEther', 0)
    }
});