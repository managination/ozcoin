contract('Certificates', function(accounts) {
  it("should register a PoA ", function() {
    var cert = Certificate.deployed();

      return cert.registerProofOfAsset.sendTransaction("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG","ID1234").then(function(Tx) {
        console.log(Tx);
        cert.getNumberOfCertificates.call().then(function(num) {
        return  assert.equal(num.valueOf(),1);
      });
  });
});
it("should register an Audit Report ", function() {
  var cert = Certificate.deployed();

    return cert.registerAuditReport.sendTransaction("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG","ID456").then(function(Tx) {
      console.log(Tx);
      cert.getNumberOfCertificates.call().then(function(num) {
      return  assert.equal(num.valueOf(),2);
    });
});
});



});
