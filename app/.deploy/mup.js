module.exports = {
    servers: {
        one: {
            host: '13.90.153.50',
            username: 'mroon',
            pem: '/Users/mroon/.ssh/id_rsa'
            // password:
            // or leave blank for authenticate from ssh-agent
        }
    },

    meteor: {
        name: 'OzCoins',
        path: '../',
        servers: {
            one: {},
        },
        buildOptions: {
            serverOnly: true,
        },
        env: {
            ROOT_URL: 'ozcoin.mngn.io',
            MONGO_URL: 'mongodb://localhost/meteor',
        },

        // change to 'kadirahq/meteord' if your app is not using Meteor 1.4
        dockerImage: 'abernix/meteord:base',
        deployCheckWaitTime: 60,

        // Show progress bar while uploading bundle to server
        // You might need to disable it on CI servers
        enableUploadProgressBar: true
    },

    mongo: {
        oplog: true,
        port: 27017,
        version: '3.4.2',
        servers: {
            one: {},
        },
    },
};
