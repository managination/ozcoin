import {Promise} from 'meteor/promise';
import {txutils} from 'eth-lightwallet';
import {getWeb3} from '../../imports/api/ethereum-services';
import {getContract} from '../../imports/api/contracts/ethereum-contracts';
import {add0x} from '../../imports/api/ethereum-services';
import {Profiles} from '../../imports/api/model/profiles';

export const createRawTx = function (userId, contractNme, funcName) {
    let web3 = getWeb3();
    let gasPrice = web3.toHex(web3.eth.gasPrice);
    let profile = Profiles.findOne({owner: userId});

    return getContract(contractNme).then((contract) => {
        let functionName = undefined;
        let args = Array.from(arguments).slice(3);
        let payloadData = contract[funcName].getData.apply(this, args);
        let gasEstimate = web3.toHex(web3.eth.estimateGas({
                to: contract.address,
                data: payloadData
            }) + 10000);

        let nonce = web3.eth.getTransactionCount(profile.address);

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasEstimate,
            to: contract.address,
            from: profile.address,
            value: '0x00',
            data: payloadData,
        };

        let rawTxString = txutils.functionTx(contract.abi, funcName, args, rawTx);

        return rawTxString;
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
                console.log("transaction hash", txHash);
            } else {
                console.log("transaction already exists", txHash);
                resolve(txHash);
            }
        })
    },

    'wait-for-tx-mining': function (txHash) {
        if (txHash && typeof txHash === 'string' && getWeb3().eth.getTransaction(txHash)) {
            return new Promise((resolve, reject) => {
                let txloop = Meteor.setInterval(Meteor.bindEnvironment(function () {
                    try {
                        let tx = getWeb3().eth.getTransaction(txHash);
                        if (tx.blockNumber) {
                            Meteor.clearInterval(txloop);
                            resolve(tx);
                        }
                    } catch (err) {
                        reject(new Meteor.Error("wait for TX to mine", err.message));
                    }
                }), 1000);
            })
        } else {
            throw new Meteor.Error("the txHash is mandatory and must be a string identifying a transaction");
        }
    },

});