import {Meteor} from "meteor/meteor";
import {Promise} from "meteor/promise";
import {keystore, signing} from "eth-lightwallet";
import W3 from "web3";
import * as LocalStorage from "meteor/simply:reactive-local-storage";
import BigNumber from "bignumber.js";

export const ether = new BigNumber("1000000000000000000");
export const ozcoin = new BigNumber("1000000");

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
                                Meteor.call('update-balance', function (err, result) {
                                    if (err)
                                        console.log("ERROR", err);
                                })
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
        let provider = new W3.providers.HttpProvider(Meteor.settings.public.ethNodeAddress);
        // let provider = new W3.providers.HttpProvider('http://localhost:8545');
        //let provider = new W3.providers.HttpProvider('https://ropsten.infura.io/NgjvCOUF5UIhCgRKndzD');
        w3 = new W3(provider);
        initialisedWeb3 = w3;
    }
    return w3;
};

export const signAndSubmit = (password, rawTx, waitForMining) => {
    return new Promise((resolve, reject) => {
        wallet.keyFromPassword(password, (err, pwDerivedKey) => {
            if (err) {
                reject(err);
                return;
            }
            let signedTxString = signing.signTx(wallet, pwDerivedKey, add0x(rawTx), add0x(Meteor.user().username));
            return Meteor.callPromise('submit-raw-tx', add0x(signedTxString.toString('hex')))
                .then((result) => {
                    if (waitForMining) {
                        return Meteor.callPromise('wait-for-tx-mining', result)
                            .then((result) => {
                                resolve(result);
                            });
                    } else {
                        resolve(result);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                })
        });
    })
};

let wallet = undefined;
let pdk = undefined;
export const createKeystore = (alias, email, password, salt, mnemonic) => {
    let _resolve;
    let _reject;
    let keystoreCallback = (err, ks) => {
        if (err) reject(err);
        wallet = ks;

        // Some methods will require providing the `pwDerivedKey`,
        // Allowing you to only decrypt private keys on an as-needed basis.
        // You can generate that value with this convenient method:
        ks.keyFromPassword(password, (err, pwDerivedKey) => {
            pdk = pwDerivedKey;
            if (err) _reject(err);

            // generate one new address/private key pair
            // the corresponding private key is also encrypted
            ks.generateNewAddress(pwDerivedKey);

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

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export const isValidAddress = function (address) {
    address = add0x(address);

    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
const isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x', '');
    const addressHash = sha3(address.toLowerCase());
    for (let i = 0; i < 40; i++) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

