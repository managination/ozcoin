import {Meteor} from "meteor/meteor";
import {EJSON} from "meteor/ejson";
import {Match} from "meteor/check";
import {Promise} from "meteor/promise";
import {Contracts} from "../model/contracts";
import {getWeb3} from "../ethereum-services";
import contractDefs from "../../contract.json";

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

let contracts = {};
const createContract = (name, resolve, reject) => {

    if (!contracts[name]) try {
        if (Match.test(contractDefs[name].abi, String)) {
            contractDefs[name].abi = EJSON.parse(contractDefs[name].abi.replace(/'/g, '"'));
        }
        contracts[name] = getWeb3().eth.contract(contractDefs[name].abi).at(contractDefs[name].address);
    } catch (err) {
        reject(err);
        return;
    }
    resolve(contracts[name]);
};

export const getContract = (name) => {
    return new Promise((resolve, reject) => {
        if (subscription.ready()) {
            createContract(name, resolve, reject);
        } else {
            /*this is executed if the call is made before the subscription is ready*/
            let observer = Contracts.find({name: name}).observe({
                added: (document) => {
                    createContract(name, resolve, reject);
                    observer.stop();
                }
            })
        }
    })
};

export const callContractMethod = function (contract, funcName) {
    let args = Array.from(arguments).slice(2);
    return getContract(contract).then((contract) => {
        return contract[funcName].call.apply(this, args);
    })
};

/*start listening for events of this type*/
export const listenToEvent = function (contractName, event, filter, callback) {
    return getContract(contractName).then((contract) => {
        let listener = {
            callback: callback,
            failures: 0,
            event: contract[event](filter, {fromBlock: 'latest', toBlock: 'latest'})
        };

        (function startWatching() {
            listener.event.watch(function (error, result) {
                if (error) {
                    try {
                        listener.event.stopWatching();
                        if (listener.failures++ < 10) {
                            startWatching();
                            console.log("WARNING watcher restarted", contractName, event, error);
                        } else {
                            console.log("ERROR stopped watching", contractName, event, error);
                        }
                    } catch (exception) {
                        console.log("ERROR exception in", contractName, event, error, exception);
                    }
                } else {
                    listener.failures = 0;
                    if (typeof result == 'object' && result.args)
                        listener.callback(result);
                }
            })
        })();
    })
};

export const getCertificateContract = () => {
    return getContract('Certificate');
};

export const getUserContract = () => {
    return getContract('User');
};