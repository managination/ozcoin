import ipfsAPI from "ipfs-api";
import {EJSON} from "meteor/ejson";
import {Documents} from "../../imports/api/model/documents";
import {createRawTx, ether, ozcoin} from "./ethereum";
import {Profiles} from "../../imports/api/model/profiles";

const fs = require('fs');
// const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});
const ipfs = ipfsAPI(Meteor.settings.ipfsNode);

Meteor.methods({
    'get-affiliate': function (address) {
        let affiliate = Profiles.findOne({address: address}, {fields: {alias: 1, address: 1, affiliateCompany: 1}});
        return affiliate;
    },

    'get-ozc-affiliate-price': function (address) {
        let userProfile = Profiles.findOne({owner: this.userId});
        let profile = {};
        if (userProfile) {
            profile = Profiles.findOne({address: userProfile.affiliateCompany}, {fields: {alias: 1, price: 1}});
            if (profile && profile.prices && profile.price.sell) {
                profile.price.sell = new BigNumber(profile.price.sell.toString()).dividedBy(ether).times(ozcoin).toNumber();
            }
        }
        return profile;
    },

    'update-user-details': function (userDetails) {
        let self = this;
        delete userDetails.balance;
        delete userDetails.ozcBalance;
        delete userDetails.formattedEthBalance;
        delete userDetails.formattedOzcBalance;
        let currentProfile = Profiles.findOne({_id: userDetails._id});
        Profiles.update({_id: userDetails._id}, {$set: userDetails});
        if (userDetails.owner != this.userId && currentProfile && currentProfile.role != userDetails.role) {
            return createRawTx(this.userId, "User", "changeRole", 0, currentProfile.address, userDetails.role);
        } else {
            return {zeroBalance: true};
        }
    },

    'make-affiliate-company': function (userDetails) {
        let account = userDetails.address;
        let name = userDetails.alias;
        let details = EJSON.stringify({email: userDetails.email, alias: userDetails.alias});
        let affiliateAccount = userDetails.address;
        let affiliateCompany = userDetails.address;

        return createRawTx(this.userId, "User", "updateUserDetails", 0,
            account, name, details, affiliateAccount, affiliateCompany);
    },

    'register-user': function () {
        let profile = Profiles.findOne({owner: this.userId});
        let alias = profile.alias;
        let address = profile.address;
        let details = EJSON.stringify({email: profile.email, alias: profile.alias});
        return createRawTx(this.userId, 'User', 'createCoinOwner', 0, address, profile.affiliate, profile.affiliateCompany, alias, details);
    },

    'file-upload': function (docType, fileName, documentId, fileData) {
        console.log("received file ", fileName, " data: ", fileData.size);
        let fileStream = new Buffer(fileData, 'binary');

        return ipfs.util.addFromStream(fileStream).then((result) => {
            result = result[0];
            /*the path is equal to the hash*/
            delete result.path;
            /*add a documentId to the result to provide a human readable version*/
            result.documentId = documentId;
            result.docType = docType;
            result.uploadTime = new Date();
            Documents.upsert({hash: result.hash}, result);
            console.log("file uploaded to IPFS", result);

            let funcName = undefined;
            if (docType == 'audit-report') {
                funcName = 'registerAuditReport';
            } else {
                funcName = 'registerProofOfAsset';
            }
            console.log("creating raw transaction");
            let promise = createRawTx(this.userId, 'Certificate', funcName, 0, result.hash, documentId);
            return promise;
        }).catch((err) => {
            console.log(err);
            throw err
        });

    },
});

