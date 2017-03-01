import {Meteor} from "meteor/meteor";
import {EJSON} from "meteor/ejson";
import {Match} from "meteor/check";
import {Promise} from "meteor/promise";
import {getWeb3} from "../ethereum-services";
import contractDefs from "../../contract.json";

let contracts = {};
export const getContract = (name) => {
    return new Promise((resolve, reject) => {
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
    });
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

        startWatching = function () {
            try {
                listener.event.watch(function (error, result) {
                    if (error) {
                        try {
                            listener.event.stopWatching();
                            if (listener.failures++ < 10) {
                                Meteor.setTimeout(startWatching, 1000);
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
            } catch (error) {
                console.log("ERROR did not start watching", contractName, event, error);
            }
        };
        startWatching();
    })
};
