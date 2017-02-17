import {Meteor} from 'meteor/meteor';
import {EJSON} from 'meteor/ejson';
import {Match} from 'meteor/check'
import {Promise} from 'meteor/promise';
import {Contracts} from '../model/contracts';
import {getWeb3} from '../ethereum-services';

let subscription = undefined;
Meteor.startup(() => {
    if (Meteor.isClient) {
        subscription = Meteor.subscribe('contracts', () => {
            console.log("got all the contracts");
        });
    } else {
        subscription = {ready: () => true};
    }
});

let certificatContract = {address: null};
const createContract = (name, resolve, reject, observer) => {
    let newVersion = Contracts.findOne({name: name});
    if (newVersion.address != certificatContract.address) try {
        if (Match.test(newVersion.abi, String)) {
            newVersion.abi = EJSON.parse(newVersion.abi.replace(/'/g, '"'));
            console.log("had to convert abi from string");
        }
        certificatContract = getWeb3().eth.contract(newVersion.abi).at(newVersion.address);
    } catch (err) {
        reject(err);
        return;
    }
    resolve(certificatContract);
    // stop the cursor obeserver if appropriate
    if (observer) observer.stop();
};

const getContract = (name) => {
    return new Promise((resolve, reject) => {
        if (subscription.ready()) {
            createContract(name, resolve, reject);
        } else {
            /*this is executed if the call is made before the subscription is ready*/
            let observer = Contracts.find({name: name}).observe({
                added: (document) => {
                    createContract(name, resolve, reject, observer);
                }
            })
        }
    })
};

export const getCertificateContract = () => {
    return getContract('Certificate');
};

export const getUserContract = () => {
    return getContract('User');
};