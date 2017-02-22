import ipfsAPI from "ipfs-api";
import {EJSON} from "meteor/ejson";
import {Documents} from "../../imports/api/model/documents";
import {createRawTx} from "./ethereum";
import {Profiles} from "../../imports/api/model/profiles";

const fs = require('fs');
// const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});
const ipfs = ipfsAPI(Meteor.settings.ipfsNode);

Meteor.methods({
    'register-user': function () {
        let profile = Profiles.findOne({owner: this.userId});
        delete profile._id;
        delete profile.owner;
        let alias = profile.alias;
        delete profile.alias;
        let address = profile.address;
        delete profile.address;
        delete profile.balance;
        let details = EJSON.stringify(profile);
        return createRawTx(this.userId, 'User', 'createCoinOwner', address, profile.affiliate, profile.affiliateCompany, alias, details);
    },

    'file-upload': function (docType, fileName, documentId, fileData) {
        console.log("received file ", fileName, " data: ", fileData.size, fileData.name);
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
            console.log(result);
            fs.writeFile(result.hash, fileData, fileStream);

            let funcName = undefined;
            if (docType == 'audit-report') {
                funcName = 'registerAuditReport';
            } else {
                funcName = 'registerProofOfAsset';
            }
            let promise = createRawTx(this.userId, 'Certificate', funcName, result.hash, documentId);
            return promise;
        }).catch((err) => {
            console.log(err);
            throw err
        });

    },
});

