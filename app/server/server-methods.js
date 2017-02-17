import Future from 'fibers/future';
import ipfsAPI from 'ipfs-api';
import {txutils} from 'eth-lightwallet';
import {Documents} from '../imports/api/model/documents';
import {Profiles} from '../imports/api/model/profiles';
import {getWeb3} from '../imports/api/ethereum-services';
import {getCertificateContract} from '../imports/api/contracts/ethereum-contracts';
const fs = require('fs');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});
import {add0x} from '../imports/api/ethereum-services';

import {executeTxLW} from './fixed-transaction';

Meteor.methods({
    'file-upload': function (docType, fileName, documentId, fileData) {
        console.log("received file ", fileName, " data: ", fileData.size, fileData.name);
        let fileStream = new Buffer(fileData, 'binary');
        let profile = Profiles.findOne({owner: this.userId});
        var future = new Future();

        ipfs.util.addFromStream(fileStream).then((result) => {
            result = result[0];
            /*the path is equal to the hash*/
            delete result.path;
            /*add a filename to the result to provide a human readable version*/
            result.fileName = fileName;
            Documents.upsert({hash: result.hash}, result);
            console.log(result);
            fs.writeFile(result.hash, fileData, fileStream);

            let w3 = getWeb3();
            let gasPrice = w3.toHex(w3.eth.gasPrice);

            return getCertificateContract().then((contract) => {
                let payloadData = undefined;
                let functionName = undefined;
                if (docType == 'audit-report') {
                    functionName = 'registerAuditReport';
                    payloadData = contract.registerAuditReport.getData(result.hash, documentId);
                } else {
                    functionName = 'registerProofOfAsset';
                    payloadData = contract.registerProofOfAsset.getData(result.hash, documentId);
                }
                let gasEstimate = w3.toHex(w3.eth.estimateGas({
                        to: contract.address,
                        data: payloadData
                    }) + 10000);

                let nonce = w3.toHex(w3.eth.getTransactionCount(profile.address) + 10000);

                var rawTx = {
                    nonce: nonce,
                    gasPrice: gasPrice,
                    gasLimit: gasEstimate,
                    to: contract.address,
                    from: profile.address,
                    value: '0x00',
                };

                let rawTxString = txutils.functionTx(contract.abi, functionName, [result.hash, documentId], rawTx);

                future.return(rawTxString);
            }).catch((err) => {
                throw err;
            });
        }).catch((err) => {
            console.log(err);
            throw err
        });

        let rawTx = future.wait();
        return rawTx;
    },

    'submit-raw-tx': function (rawTxHexString) {
        var future = new Future();
        var txHash = getWeb3().sha3(rawTxHexString, {encoding: 'hex'});
        console.log("computed hash is", txHash);
        if (!getWeb3().eth.getTransaction(txHash)) {
            getWeb3().eth.sendRawTransaction(add0x(rawTxHexString), function (err, hash) {
                console.log('transaction hash is', hash);
                if (err) {
                    future.throw(new Meteor.Error('web3-error', err.message));
                } else {
                    future.return(hash);

                    /*
                     let txloop = Meteor.setInterval(Meteor.bindEnvironment(function () {
                     let tx = getWeb3().eth.getTransaction(hash);
                     if (tx.blockNumber) {
                     txloop.stop();
                     future.return(tx);
                     }
                     }), 1000);
                     */
                }
            });
        } else {
            console.log("transaction already exists", txHash);
            future.return(txHash);
        }
        return future.wait();
    },

    'submit-predefined-tx': function (privateKey) {
        // executeTx(getWeb3(), privateKey);
        executeTxLW();
    }
});

