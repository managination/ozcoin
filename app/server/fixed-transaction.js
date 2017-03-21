import Tx from "ethereumjs-tx";
import {getWeb3, add0x} from "../../../LuckyDAO/app/imports/ethereum/ethereum-services";
import {signing, keystore, txutils} from "eth-lightwallet";

export const executeTx = (web3) => {
    let privateKey = "fff7b3e0508db1b9059c7542e6287c5ff8013413dd9ced1ca50dc86916c0f353";
    let nonce = web3.eth.getTransactionCount('0x77454e832261aeed81422348efee52d5bd3a3684') + 1;
    console.log("nonce", nonce);

    var rawTx = {
        nonce: nonce,
        gasPrice: 20000000000,
        gasLimit: 121001,
        to: '0xD0362fa02fE45367fd7b5fd126ee94a42a57D779',
        from: '0x77454e832261aeed81422348efee52d5bd3a3684',
        value: web3.toHex(web3.toWei(1, "ether")),
    };

    let tx = new Tx(rawTx);
    tx.sign(Buffer.from(privateKey, 'hex'));
    let signedTxString = tx.serialize();

    console.log('0x' + signedTxString.toString('hex'));
    web3.eth.sendRawTransaction('0x' + signedTxString.toString('hex'), function (err, hash) {
        if (err) {
            console.log(err);
        } else {
            console.log('transaction hash is', hash);
        }
    });
};

export const executeTxLW = () => {
    console.log("creating transaction");
    // let provider = new web3.providers.HttpProvider('http://localhost:8545');
    let web3 = getWeb3();

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

            let rawTxString = add0x(txutils.valueTx(rawTx));
            let signedTxString = add0x(signing.signTx(ks, pwDerivedKey, add0x(rawTxString)), '0x77454e832261aeed81422348efee52d5bd3a3684');
            console.log(signedTxString);

            web3.eth.sendRawTransaction(signedTxString.toString('hex'), function (err, hash) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('transaction hash is', hash);
                }
            });
        });
    });
};

Meteor.startup(() => {
    // executeTx(getWeb3());
});