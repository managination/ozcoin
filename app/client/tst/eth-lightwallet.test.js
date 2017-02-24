import * as LocalStorage from "meteor/simply:reactive-local-storage";
import {keystore} from "eth-lightwallet";
import {chai} from "meteor/practicalmeteor:chai";

describe('keystore methods', function () {
    it('generates the same password derived key in successive calls', function () {
        keystore.createVault({
            password: 'password',
            seedPhrase: "address wealth torch panel aspect brief edit found invite dumb build neither",
        }, (err, ks) => {
            if (err) reject(err);

            ks.keyFromPassword('password', (err, pwDerivedKey) => {
                pdk = pwDerivedKey;
                ks.keyFromPassword('password', (err, pwDerivedKey) => {
                    chai.assert.equal(pdk.toString(), pwDerivedKey.toString());
                });
            });

        })
    });

    it('serializes and deserializes the keystore correctly', function () {
        let pdk = undefined;
        keystore.createVault({
            password: 'password',
            seedPhrase: "address wealth torch panel aspect brief edit found invite dumb build neither",
        }, (err, ks) => {
            if (err) throw(err);

            ks.keyFromPassword('password', (err, pwDerivedKey) => {
                console.log(pwDerivedKey, err);
                pdk = pwDerivedKey;
            });

            LocalStorage.setItem('keystore', ks.serialize());
        });

        setTimeout(() => {
            let serializedKeystore = LocalStorage.getItem('keystore');

            ks = keystore.deserialize(serializedKeystore);
            ks.keyFromPassword('password', (err, pwDerivedKey) => {
                console.log(pwDerivedKey, err);
                chai.assert.equal(pdk.toString(), pwDerivedKey.toString());
            });

        }, 2000)

    })
});