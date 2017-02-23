import {Meteor} from "meteor/meteor";
import {Match} from "meteor/check";
import {EJSON} from "meteor/ejson";
import {Contracts} from "../../imports/api/model/contracts";
import {getWeb3} from "../../imports/api/ethereum-services";
import {nameRegistry} from "../../imports/api/contracts/name-registry";

let nameRegistryContract = getWeb3().eth.contract(nameRegistry.abi).at(nameRegistry.address);
const getContracts = (name) => {
    try {
        let contract = nameRegistryContract.getContractDetails.call(name);
        // console.log("contract: ", name, 'address:', contract[0]);
        let contractAbi = contract[1];
        if (Match.test(contractAbi, String)) {
            contractAbi = EJSON.parse(contractAbi.replace(/'/g, '"'));
        }
        Contracts.upsert({name: name}, {name: name, address: contract[0], abi: contractAbi});
    } catch (err) {
        // just fail silently
        // console.log(err);
    }
};

Meteor.startup(() => {
    Meteor.setInterval(() => {
        getContracts("User");
        getContracts("Certificate");
        getContracts("TokenData");
    }, 10000);
});

