import {Meteor} from 'meteor/meteor';
import {Contracts} from '../imports/api/model/contracts';
import {getWeb3} from '../imports/api/ethereum-services';
import {nameRegistry} from '../imports/api/contracts/name-registry';

let nameRegistryContract = getWeb3().eth.contract(nameRegistry.abi).at(nameRegistry.address);
const getContracts = (name) => {
    try {
        let contract = nameRegistryContract.getContractDetails.call(name);
        Contracts.upsert({name: name}, {name: name, address: contract[0], abi: contract[1]});
    } catch (err) {
        console.log(err);
    }
};

Meteor.startup(() => {
    Meteor.setInterval(() => {
        getContracts("User");
        getContracts("Certificate");
    }, 10000);
});

