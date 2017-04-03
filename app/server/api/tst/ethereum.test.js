import {chai} from "meteor/practicalmeteor:chai";
import {callContractMethod} from "../../../imports/api/contracts/ethereum-contracts";

describe('execute web3js calls', function () {
    it('gets details of registered users', function () {
        callContractMethod('User', 'getUserDetails', "0x77454e832261aeed81422348efee52d5bd3a3684").then((result) => {
            chai.assert.equal(result[0], "0x77454e832261aeed81422348efee52d5bd3a3684");
        })
    });
    it('returns 0x00 address for unregistered users', function () {
        callContractMethod('User', 'getUserDetails', "0x88454e832261aeed81422348efee52d5bd3a3684").then((result) => {
            chai.assert.equal(result[0], "‌0x0000000000000000000000000000000000000000000000000000000000000000");
        })
    })
});