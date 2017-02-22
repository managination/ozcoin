import {keystore} from "eth-lightwallet";
import {chai} from "meteor/practicalmeteor:chai";

describe('keystore methods', function () {
    it('generates the same password derived key in successive calls', function () {
        keystore.createVault({
            password: 'password',
            seedPhrase: "address wealth torch panel aspect brief edit found invite dumb build neither",
        }, (err, ks) => {
            if (err) reject(err);
            wallet = ks;

            // Some methods will require providing the `pwDerivedKey`,
            // Allowing you to only decrypt private keys on an as-needed basis.
            // You can generate that value with this convenient method:
            ks.keyFromPassword('password', (err, pwDerivedKey) => {
                pdk = pwDerivedKey;
                ks.keyFromPassword('password', (err, pwDerivedKey) => {
                    chai.assert.equal(pdk.toString(), pwDerivedKey.toString());
                });
            });

        })
    })
});