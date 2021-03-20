App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    $('#TTBalance').text("0");
    return App.initWeb3();
  },

  initWeb3: function() {
    
    // set the provider you want from Web3.providers
    App.web3Provider = new Web3.providers.HttpProvider('https://sandbox.truffleteams.com/4825805b-e2ee-4604-a014-5727024f68d6');
    web3 = new Web3(App.web3Provider);
    
    console.log(App.web3Provider.isConnect);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Pincod.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var PincodArtifact = data;
      App.contracts.Pincod = TruffleContract(PincodArtifact);

      // Set the provider for our contract.
      App.contracts.Pincod.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.getBalances);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();

    console.log('Transfer ' + amount + ' TT to ' + toAddress);

    var PincodInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pincod.deployed().then(function(instance) {
        PincodInstance = instance;

        return PincodInstance.transfer(toAddress, amount, {from: account, gas: 100000});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function() {
    console.log('Getting balances...');

    var tokenInstance;
    var toAddress = $('#TTTransferAddress').val();

    App.contracts.Pincod.deployed().then(function(instance) {
      tokenInstance = instance;

      return tokenInstance.balanceOf(toAddress);
    }).then(function(result) {
      balance = result.c[0];

      $('#TTBalance').text(balance);
    }).catch(function(err) {
      console.log(err.message);
    });
    
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
