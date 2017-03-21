import {Promise} from "meteor/promise";
import {txutils} from "eth-lightwallet";
import BigNumber from "bignumber.js";
import {getWeb3, add0x} from "../../../../LuckyDAO/app/imports/ethereum/ethereum-services";
import {getContract} from "../../../../LuckyDAO/app/imports/ethereum/ethereum-contracts";
import {Profiles} from "../../imports/api/model/profiles";
import {updateProfileEthBalance} from "../agents/data-sync";

export const ether = new BigNumber("1000000000000000000");
export const ozcoin = new BigNumber("1000000");

const getNonce = function (profile) {
    let web3 = getWeb3();
    /*the nonce is the count of the next transaction*/
    let nonce = web3.eth.getTransactionCount(profile.address, "pending");
    Profiles.update({_id: profile._id}, {$set: {lastNonce: nonce}});
    console.log("transactions including pending", nonce);
    return nonce;
};

export const createRawValueTx = function (userId, recipient, value) {
    return new Promise((resolve, reject) => {
        let web3 = getWeb3();
        let gasPrice = web3.toHex(web3.eth.gasPrice);
        let profile = Profiles.findOne({owner: userId});

        let gasEstimate = web3.toHex(web3.eth.estimateGas({
            to: recipient,
            value: web3.toHex(value),
        }));

        let nonce = getNonce(profile);
        console.log("the nonce is", nonce);

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasEstimate,
            to: recipient,
            from: profile.address,
            value: web3.toHex(value),
        };

        let rawTxString = txutils.valueTx(rawTx);

        resolve({
            rawTx: rawTxString,
            transactionCost: new BigNumber(gasEstimate.toString()).times(gasPrice).dividedBy(ether).toNumber(),
            accountBalance: web3.eth.getBalance(profile.address).dividedBy(ether).toNumber(),
        });
    })
};

export const createRawTx = function (userId, contractName, funcName, value) {
    let web3 = getWeb3();
    let gasPrice = web3.toHex(web3.eth.gasPrice);
    let profile = Profiles.findOne({owner: userId});

    return getContract(contractName).then((contract) => {
        let args = Array.from(arguments).slice(4);
        let payloadData = contract[funcName].getData.apply(this, args);
        let gasEstimate = web3.toHex(web3.eth.estimateGas({
                to: contract.address,
                value: web3.toHex(value),
                data: payloadData
            }) * 5);

        let nonce = getNonce(profile);
        console.log("the nonce is", nonce, "gas estimate", gasEstimate / 5);

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasEstimate,
            to: contract.address,
            from: profile.address,
            value: web3.toHex(value),
            data: payloadData,
        };

        let rawTxString = txutils.functionTx(contract.abi, funcName, args, rawTx);

        return {
            rawTx: rawTxString,
            transactionCost: new BigNumber(gasEstimate.toString()).times(gasPrice).dividedBy(ether).toNumber(),
            accountBalance: web3.eth.getBalance(profile.address).dividedBy(ether).toNumber(),
        };
    }).catch((err) => {
        throw new Meteor.Error("create function call for contract", err.message);
    });

};

Meteor.methods({
    'submit-raw-tx': function (rawTxHexString) {
        var txHash = getWeb3().sha3(rawTxHexString, {encoding: 'hex'});
        console.log("computed hash is", txHash);
        return new Promise((resolve, reject) => {
            if (!getWeb3().eth.getTransaction(txHash)) {
                getWeb3().eth.sendRawTransaction(add0x(rawTxHexString), function (err, hash) {
                    console.log('transaction hash is', hash);
                    if (err) {
                        reject(new Meteor.Error('web3-error', err.message));
                    } else {
                        resolve(hash);
                    }
                });
            } else {
                console.log("transaction already exists", txHash);
                resolve(txHash);
            }
        })
    },

    'wait-for-tx-mining': function (txHash, sender, recipient) {
        if (txHash && typeof txHash === 'string' && getWeb3().eth.getTransaction(txHash)) {
            return new Promise((resolve, reject) => {
                console.log("pending transactions", getWeb3().eth.pendingTransactions);
                let txloop = Meteor.setInterval(Meteor.bindEnvironment(function () {
                    try {
                        const web3 = getWeb3();
                        let tx = web3.eth.getTransaction(txHash);
                        if (tx && tx.blockNumber) {
                            console.log("transaction", tx);
                            console.log("receipt", web3.eth.getTransactionReceipt(txHash));
                            Meteor.clearInterval(txloop);
                            if (sender)
                                updateProfileEthBalance(Profiles.findOne({address: sender}));
                            if (recipient)
                                updateProfileEthBalance(Profiles.findOne({address: recipient}));
                            resolve(web3.eth.getTransactionReceipt(txHash));
                        }
                    } catch (err) {
                        console.log("ERROR: wait for tx to mine", err);
                        Meteor.clearInterval(txloop);
                        reject(new Meteor.Error("wait for TX to mine", err.message));
                    }
                }), 1000);
            })
        } else {
            throw new Meteor.Error("the txHash is mandatory and must be a string identifying a transaction");
        }
    },

});