import ipfsAPI from 'ipfs-api';
import {Documents} from '../imports/api/documents';

const fs = require('fs');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});

Meteor.methods({
    'file-upload': function (fileName, fileData) {
        console.log("received file ", fileName, " data: ", fileData.size, fileData.name);
        let fileStream = new Buffer(fileData, 'binary');
        ipfs.util.addFromStream(fileStream).then((result) => {
            result = result[0];
            /*the path is equal to the hash*/
            delete result.path;
            /*add a filename to the result to provide a human readable version*/
            result.fileName = fileName;
            Documents.upsert({hash: result.hash}, result);
            console.log(result);
            fs.writeFile(result.hash, fileData, fileStream);
        }).catch((err) => {
            console.log(err);
            throw err
        })
    }
});