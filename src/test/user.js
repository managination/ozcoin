contract('User', function(accounts) {

    it("should check no users exist", function() {
        var user = User.deployed();
        user.getTotalNumberOfUsers.call().then(function(num) {
            return assert.equal(num.valueOf(), 0);

        });
    });

    it("should create a Coin User", function() {
        var user = User.deployed();
        user.createCoinOwner.sendTransaction(accounts[1], accounts[0], "John Doe", "{address : St John's Street,phone : 0207 568 1255}").then(function(Tx) {
            user.getTotalNumberOfUsers.call().then(function(num) {
                return assert.equal(num.valueOf(), 1);


            });
        });
    });

    it("should create a Coin User, then Auditor", function() {
        var user = User.new().then(function(instance) {


            instance.createCoinOwner.sendTransaction(accounts[1], accounts[0], "John Doe", "{address : St John's Street,phone : 0207 568 1255}").then(function(Tx) {
              instance.createAuditor.sendTransaction(accounts[1]).then(function(Tx) {
                  instance.checkRegistration.call(accounts[1]).then(function(results) {
                      assert.equal(results[0], true);
                      assert.equal(results[1].valueOf(), 5);
                      // now shouldn't be possible to re assign role
                      instance.createEscrowAgent.sendTransaction(accounts[1]).then(function(Tx) {
                        assert.equal(results[0], true);
                        assert.equal(results[1].valueOf(), 5);

                        });
                      });

                });
            });
        });
    });

    it("should create a Coin User, then CertificateCreator", function() {
        var user = User.new().then(function(instance) {

            console.log(instance.address);
            instance.createCoinOwner.sendTransaction(accounts[1], accounts[0], "John Doe", "{address : St John's Street,phone : 0207 568 1255}").then(function(Tx) {
              instance.createCertificateCreator.sendTransaction(accounts[1]).then(function(Tx) {
                  instance.checkRegistration.call(accounts[1]).then(function(results) {
                     assert.equal(results[0], true);
                     assert.equal(results[1].valueOf(), 4);
                     instance.createEscrowAgent.sendTransaction(accounts[1]).then(function(Tx) {
                       assert.equal(results[0], true);
                       assert.equal(results[1].valueOf(), 4);
                        });
                      });

                });
            });
        });
    });


});
