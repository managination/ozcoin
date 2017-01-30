var ipfsAPI = require('ipfs-api')

var ipfs;

Meteor.startup(() => {
    // connect to ipfs daemon API server
    ipfs = ipfsAPI ('localhost', '5001', { protocol: 'http' });
});


