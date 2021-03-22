

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

    web3.eth.getAccounts().then((result) => {
      console.log("Accounts:",result);
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
      App.owner();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#reveal', function(){App.getBalances()});
    $(document).on('click', '#getAddress', function(){App.getAddress()});
    $(document).on('click', '#insertButton', function(){App.insertProduct()});
    $(document).on('click', '#getProduct', function(){App.getProduct()});
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

  getAddress:  function() {
    console.log("caa");

    var passphrase = $("#passphrase").val();

    web3.eth.personal.newAccount(passphrase).then(function(address){
      web3.eth.personal.unlockAccount(address,passphrase,15000);
      $('#ownAddress').text(address);
      //$('#ownPrivateKey').text(address['privateKey']);
    });
   
  },

  totalSupply: function() {
    App.contracts.Pincod.methods.totalSupply().call().then(function(result) {
      console.log("Total supply on network:", result);
      $("#total-supply").text(result + " PINCOD");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  insertProduct: function() {
    var barcode = $("#barcode").val();
    var title = $("#title").val();
    var description = $("#description").val();
    var brand = $("#brand").val();
    var category = $("#category").val();
    var fromAddress = $("#ownAddress").text();

    fromAddress = "0x71b3Bcb590DfBfbbEE8560e1F7b6f0F92372b50E";

    //console.log(fromAddress);
    //web3.eth.defaultAccount = fromAddress;
    //console.log(web3.eth.defaultAccount);

    App.contracts.Pincod.methods.mint(title, description, brand, category, barcode, "").send({from: fromAddress, gas:3000000}).then(function(result) {
      //console.log("Product insert transaction:", result);
      $("#message").text("Success!");
      $("#message").css('color', 'green');

      $("#product-code").text( "Product code: "+result.transactionHash);

      App.totalSupply();
    }).catch(function(err) {
      console.log(err.message);
      $("#message").text(err.message);
      $("#message").css('color', 'red');
    });
  },

  owner: function() {
    App.contracts.Pincod.methods.owner().call({gas:3000000}).then(function(result) {
      console.log("Owner:", result);
      $("#admin").text(result);
      App.totalSupply();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  getProduct: function() {
    var barcode = $("#barcode-check").val();
    fromAddress = "0x71b3Bcb590DfBfbbEE8560e1F7b6f0F92372b50E";

    console.log(barcode);

    App.contracts.Pincod.methods.setUsage(barcode).call({from: fromAddress, gas:3000000}).then(function(result) {
      App.contracts.Pincod.methods.getProductFromBarcode(barcode).call({from: fromAddress, gas:3000000}).then(function(result) {
        //console.log("Product:", result);
        $("#product-title").text(result["name"]);
        $("#product-description").text(result["description"]);
        $("#product-brand").text(result["brand"]);
        $("#product-category").text(result["category"]);
        $("#product-barcode").text(barcode);
      }).catch(function(err) {
        console.log(err.message);
      });
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
