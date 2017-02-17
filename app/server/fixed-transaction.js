import Tx from 'ethereumjs-tx';

export const executeTx = (web3) => {
    let privateKey = "fff7b3e0508db1b9059c7542e6287c5ff8013413dd9ced1ca50dc86916c0f353";
    let nonce = web3.toHex(web3.eth.getTransactionCount('0x77454e832261aeed81422348efee52d5bd3a3684') + 10000);

    var rawTx = {
        nonce: nonce,
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(22000),
        to: '0xD0362fa02fE45367fd7b5fd126ee94a42a57D779',
        from: '0x77454e832261aeed81422348efee52d5bd3a3684',
        value: '0x12',
        data: undefined,
    };

    let tx = new Tx(rawTx);
    tx.sign(Buffer.from(privateKey, 'hex'));
    let signedTxString = tx.serialize();

    web3.eth.sendRawTransaction('0x' + signedTxString.toString('hex'), function (err, hash) {
        if (err) {
            console.log(err);
        } else {
            console.log('transaction hash is', hash);
        }
    });
};

import {signing} from 'eth-lightwallet';
import {keystore} from 'eth-lightwallet';
import {txutils} from 'eth-lightwallet';
import web3 from 'web3';

export const executeTxLW = () => {
    let provider = new web3.providers.HttpProvider('https://ropsten.infura.io/NgjvCOUF5UIhCgRKndzD');
    let web3 = new web3(provider);

    let nonce = web3.toHex(web3.eth.getTransactionCount('0x77454e832261aeed81422348efee52d5bd3a3684') + 10000);

    keystore.createVault({
        password: 'ppp',
        seedPhrase: "address wealth torch panel aspect brief edit found invite dumb build neither",
        salt: "jpOdt6rKmZuEEKWDVhdFLaudYweyck+6fZPjJSzRcgc="
    }, (err, ks) => {
        if (err) {
            console.log(err);
            return;
        }

        ks.keyFromPassword('ppp', (err, pwDerivedKey) => {
            if (err) {
                console.log(err);
                return;
            }
            ks.generateNewAddress(pwDerivedKey);
            console.log(ks.getAddresses()[0]); //should be 0x77454e832261aeed81422348efee52d5bd3a3684

            var rawTx = {
                nonce: nonce,
                gasPrice: web3.toHex(web3.eth.gasPrice),
                gasLimit: web3.toHex(22000),
                to: '0xD0362fa02fE45367fd7b5fd126ee94a42a57D779',
                from: '0x77454e832261aeed81422348efee52d5bd3a3684',
                value: web3.toHex(web3.toWei(1, "ether")),
                data: undefined,
            };

            let rawTxString = txutils.valueTx(rawTx);
            let signedTxString = signing.signTx(ks, pwDerivedKey, '0x' + rawTxString, '0x77454e832261aeed81422348efee52d5bd3a3684');

            web3.eth.sendRawTransaction('0x' + signedTxString.toString('hex'), function (err, hash) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('transaction hash is', hash);
                }
            });
        });
    });
};
