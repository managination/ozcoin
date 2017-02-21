import ipfsAPI from 'ipfs-api';
import {Documents} from '../../imports/api/model/documents';
import {createRawTx} from './ethereum';
const fs = require('fs');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});

Meteor.methods({
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

