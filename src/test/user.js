contract('User', function(accounts) {

    it("should check no users exist", function() {
        var user = User.deployed();
        user.getTotalNumberOfUsers.call().then(function(num) {
            return assert.equal(num.valueOf(), 0);

        });
    });
    it("should create a Coin User", function() {
        var user = User.deployed();
        user.createCoinOwner.sendTransaction(accounts[1],"John Doe","{address : St John's Street,phone : 0207 568 1255}").then(function(num) {
          user.getTotalNumberOfUsers.call().then(function(num) {
              return assert.equal(num.valueOf(), 1);


              });
        });
    });


});
