

App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    $('#TTBalance').text("0");
    $('#PincodBalance').text("0");
    $('#ownAddress').text("Click on \"Get address\" button to get your own address.");

    return App.initWeb3();
  },

  initWeb3: function() {
    
    // set the provider you want from Web3.providers

    provider = 'https://sandbox.truffleteams.com/4825805b-e2ee-4604-a014-5727024f68d6';
    
    //provider = 'https://rinkeby.infura.io/v3/e2872f8eaa75463da565837ae599bda4';
    
    App.web3Provider = new Web3.providers.HttpProvider(provider);
    web3 = new Web3(App.web3Provider);

    web3.eth.getBlockNumber().then((result) => {
      console.log("Latest Ethereum Block is ",result);
    });

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Pincod.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var PincodArtifact = data;
      

      App.contracts.Pincod = new web3.eth.Contract(PincodArtifact.abi, PincodArtifact.networks['1616260939728'].address);
      
      // Set the provider for our contract.
      App.contracts.Pincod.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      App.totalSupply();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#reveal', function(){App.getBalances()});
    $(document).on('click', '#getAddress', function(){App.getAddress()});
  },

  getBalances: function() {
    console.log('Getting balances...');
    var toAddress = $('#TTTransferAddress').val();

    App.contracts.Pincod.methods.balanceOf(toAddress).call().then(function(result) {
      $('#PincodBalance').text(result);
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  getAddress: function() {
    var address = web3.eth.accounts.create();

    $('#ownAddress').text(address['address']);
    $('#ownPrivateKey').text(address['privateKey']);
  },

  totalSupply: function() {
    //console.log('Getting totalSupply...');

    App.contracts.Pincod.methods.totalSupply().call().then(function(result) {
      console.log("Total supply on network:", result);
      $("#total-supply").text(result + " PINCOD");
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
