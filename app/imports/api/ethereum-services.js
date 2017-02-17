import {Meteor} from 'meteor/meteor';
import {Promise} from 'meteor/promise';
import {Session} from 'meteor/session'
import {keystore} from 'eth-lightwallet';
import W3 from 'web3';
import * as LocalStorage from 'meteor/simply:reactive-local-storage';

import {Profiles} from './model/profiles';

export const initializeKeystore = (() => {
    return new Promise((resolve, reject) => {
        let mnemonic = LocalStorage.getItem('mnemonic');
        if (mnemonic) {
            //TODO: decrypt the mnemonic before creating the keystore
            let mnemonic = LocalStorage.getItem('mnemonic');
            let salt = LocalStorage.getItem('salt');
            let alias = LocalStorage.getItem('alias');
            let email = LocalStorage.getItem('email');
            //TODO: remove password from localstorage and ask the user to enter it
            let password = LocalStorage.getItem('password');

            createKeystore(alias, email, password, salt, mnemonic)
                .then((ks) => {
                    return new Promise((resolve, reject) => {
                        Meteor.loginWithPassword(ks.username, ks.password, (err) => {
                            if (err)
                                reject(err);
                            else {
                                resolve(ks);
                            }
                        });
                    })
                }).then((keystore) => resolve(keystore)).catch((err) => reject(err))
        } else {
            resolve()
        }
    })
});

let initialisedWeb3 = undefined;
export const getWeb3 = () => {
    let w3 = initialisedWeb3;
    if (!w3) {
        let provider = new W3.providers.HttpProvider('http://localhost:8545');
        w3 = new W3(provider);
        initialisedWeb3 = w3;
    }
    return w3;
};

export let wallet = undefined;
export const createKeystore = (alias, email, password, salt, mnemonic) => {
    let _resolve;
    let _reject;
    let keystoreCallback = (err, ks) => {
        if (err) reject(err);

        // Some methods will require providing the `pwDerivedKey`,
        // Allowing you to only decrypt private keys on an as-needed basis.
        // You can generate that value with this convenient method:
        ks.keyFromPassword(password, (err, pwDerivedKey) => {
            wallet = {keystore: ks, pwDerivedKey: pwDerivedKey};

            if (err) _reject(err);

            // generate one new address/private key pair
            // the corresponding private key is also encrypted
            ks.generateNewAddress(pwDerivedKey);

            // set the preferred way to get a password from the user
            // TODO: change this to full screen or modal dialog
            ks.passwordProvider = (callback) => {
                var pw = prompt("Please enter password", "Password");
                callback(null, pw);
            };

            //TODO: encrypt the seed with the user's password before storing
            LocalStorage.setItem('mnemonic', ks.getSeed(pwDerivedKey));
            LocalStorage.setItem('salt', ks.salt);
            LocalStorage.setItem('alias', alias);
            LocalStorage.setItem('email', email);
            //TODO: remove password from localstorage
            LocalStorage.setItem('password', password);
            LocalStorage.setItem('username', ks.getAddresses()[0]);

            _resolve({username: ks.getAddresses()[0], password: pwDerivedKey.toString()});
        });
    };

    if (mnemonic && salt) {
        return new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
            keystore.createVault({
                password: password,
                seedPhrase: mnemonic,
                salt: salt
            }, keystoreCallback);

        });
    }
    if (mnemonic) {
        return new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
            keystore.createVault({
                password: password,
                seedPhrase: mnemonic,
            }, keystoreCallback);

        });
    }
    return new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
        keystore.createVault({
            password: password
        }, keystoreCallback);

    });

};

export const add0x = (input) => {
    if (typeof(input) !== 'string') {
        return input;
    } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
        return '0x' + input;
    } else {
        return input;
    }
};
