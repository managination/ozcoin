import {Meteor} from 'meteor/meteor';
import W3 from 'web3';

let provider = new W3.providers.HttpProvider('http://localhost:8545');
export const web3 = new W3(provider);
