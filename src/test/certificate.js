var User = artifacts.require("./User.sol");
var Certificate = artifacts.require("./Certificate.sol");


contract('Certificates', function(accounts) {
    var IPFS1 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
    var IPFS2 = "QmQG1kwx91YQsGcsa9Z1p6BPJ3amdiSLLmsmAoEMwbX61b";
    var ID1 = "ID1234";
    var ID2 = "RPT2342343";


    it("should register a PoA ", function() {
        var cert = Certificate.new().then(function(instance) {
            return instance.registerProofOfAsset.sendTransaction(IPFS1, ID1).then(function(Tx) {
                instance.getNumberOfCertificates.call().then(function(num) {
                    assert.equal(num.valueOf(), 1);
                    return instance.getCertificateDetailsByIndex.call(0).then(function(details) {
                        assert.equal(details[0], 0); // proof of asset enum
                        assert.equal(details[1], IPFS1);
                        return assert.equal(details[2], ID1);
                    });
                });
            });
        });
    });
    it("should register an Audit Report ", function() {
        var cert = Certificate.new().then(function(instance) {
            return instance.registerAuditReport.sendTransaction(IPFS2, ID2).then(function(Tx) {
                instance.getNumberOfCertificates.call().then(function(num) {
                    assert.equal(num.valueOf(), 1);
                    return instance.getCertificateDetailsByIndex.call(0).then(function(details) {
                        assert.equal(details[0].valueOf(), 1); // audit enum
                        assert.equal(details[1], IPFS2);
                        return assert.equal(details[2], ID2);
                    });
                });
            });
        });
    });


    it("should not store an empty string", function() {
        var cert = Certificate.new().then(function(instance) {
            return instance.registerAuditReport.sendTransaction("", "").then(function(Tx) {
                instance.getNumberOfCertificates.call().then(function(num) {
                    assert.equal(num.valueOf(), 0);
                });
            });
        });
    });

});
