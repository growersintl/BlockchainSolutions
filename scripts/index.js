String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "addr",
				"type": "address"
			}
		],
		"name": "changeOperatorAccount",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "holderId",
				"type": "uint256"
			}
		],
		"name": "getAssignedAddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "holderId",
				"type": "uint256"
			},
			{
				"name": "sendBackAddress",
				"type": "address"
			}
		],
		"name": "bindWithWithdrawAccount",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "addressId",
				"type": "uint256"
			},
			{
				"name": "_lockedAmount",
				"type": "uint256"
			}
		],
		"name": "unlock",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "holderId",
				"type": "uint256"
			}
		],
		"name": "assignAddress",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "addressId",
				"type": "uint256"
			}
		],
		"name": "getAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "changeOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "firstFreeAddressIndex",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "startHolderId",
				"type": "uint256"
			},
			{
				"name": "endHolderId",
				"type": "uint256"
			}
		],
		"name": "assignMultipleAddresses",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "addressId",
				"type": "uint256"
			}
		],
		"name": "lock",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "addressId",
				"type": "uint256"
			}
		],
		"name": "isLocked",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_token",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
];


//CONFIG

var providerUrl = "https://rinkeby.infura.io/ht4yyh0j0UUoTa2p9nF2";
var bankContracAddress = "0xab6c0f81411ff8fe83c935bfa9f85d5633dd3c35"; //Main Contract Address

var mnemonic ="shed inner immense vacant donkey lumber example assist maze link field trend pattern photo project"
//Mnemonic, need to be changed on production
var gasPriceInWei = "10000000000"; //10 GWEI on production need to be adjustable 
var PORT = 14520;//Port for server

require('babel-register');
require('babel-polyfill');

var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
var wallet_hdpath = "m/44'/60'/0'/0/";
var wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
var accountAddress = "0x" + wallet.getAddress().toString("hex");


var engine = new ProviderEngine();
// filters
engine.addProvider(new FilterSubprovider());

engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
engine.start(); // Required by the provider engine.

var web3 = new Web3(engine);
var contract = web3.eth.contract(abi).at(bankContracAddress);

var command = process.argv[2];


var http = require('http');
var exec = require('child_process').exec;
if (command == "server") {
    console.log("server on port " + PORT);
    http.createServer(function (req, res) {
        var str = req.url.substr(1);
        str = "node index.js " + str.replaceAll("/", " ");
        var cmd = str;
         
        exec(cmd, function (error, stdout, stderr) {
            // command output is in stdout
            if (!error) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(stdout); //write a response to the client
                res.end(); //end the response
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.write("Do not work - Command ("+cmd+") - Error ("+error+")"); //write a response to the client
                res.end(); //end the response
            }
        });

    }).listen(PORT);
    
} else
    if (command == "getAssignedAccount") {
        var arg1 = parseInt(process.argv[3]);
        var addr = contract.getAssignedAddress(arg1, function (err, val) {

            console.log(val);
            process.exit();
        });
    }else
    if (command == "getLockedAmount") {
        var arg1 = parseInt(process.argv[3]);
        var addr = contract.getAmount(arg1, function (err, val) {

            console.log(val.toNumber());
            process.exit();
        });
    }else
    if (command == "isLocked") {
        var arg1 = parseInt(process.argv[3]);
        var addr = contract.isLocked(arg1, function (err, val) {

            console.log(val);
            process.exit();
        });
    }
    else
        if (command == "assignAccount") {
            var arg1 = process.argv[3];
            var addr = contract.assignAddress.sendTransaction(arg1, {
                from: accountAddress,
                gasPrice: gasPriceInWei
            }, function (err, val) {
                if (err != null) console.log(err);
                console.log(val);
                process.exit();
            });
        }
		else
        if (command == "lock") {
            var arg1 = process.argv[3];
            var addr = contract.lock.sendTransaction(arg1, {
                from: accountAddress,
                gasPrice: gasPriceInWei
            }, function (err, val) {
                if (err != null) console.log(err);
                console.log(val);
                process.exit();
            });
        }
        else
        if (command == "unlock") {
            var arg1 =  process.argv[3];
            var arg2 =  process.argv[4];
            

            var addr = contract.unlock.sendTransaction(arg1, arg2, {
                from: accountAddress,
                gasPrice: gasPriceInWei
            }, function (err, val) {
                if (err != null) console.log(err);
                console.log(val);
                process.exit();
            });
        }
        else
            if (command == "help") {
                web3.eth.getAccounts(function (err, val) {
                    console.log("operator address " + val[0]);
                    console.log("getAssignedAccount [id] - returns address for user with [id] or 0x0000000.... if no address found");
                    console.log("assignAccount [id] - create new Address for user with id [id], asynchronous ");
					console.log("getLockedAmount [id] reads amount locked on user [id] account, this value should be passed to unlock");
                    console.log("isLocked [id] - check if address is locked");
                    console.log("getTxStatus [txhash] - return status of transaction Pending/Completed/Failed/Unknown");
                    console.log("lock [id] - locks tokens send to address of user with [id], asynchronous ");
                  //  console.log("transfer [id] [amount] - transfer amount of tokens to user [i], asynchronous ");
                    console.log("unlock [id] [amount] - checks if [amount] is valid if yes sends locked amount from account to bankContract, asynchronous ");
                    console.log("assignAccount [id] - create new Address for user with id [id], asynchronous ");
                    console.log("server - runs http server to run commands above like http://localhost:8080/assignAccount/3 ");
                    process.exit();
                });
            } else if (command == "getTxStatus") {
                var arg1 = process.argv[3];
				web3.eth.getTransaction(arg1,function(err,val){
					if(err==null){
					  if(val==null){
						 console.log("Unknown");
						 process.exit();
					  }
					  else{
						if(val.blockNumber==null){
						   console.log("Pending");
						   process.exit();
						}
						else{
							web3.eth.getTransactionReceipt(val.hash,function(err,val){
					  if(val.status==="0x1"){
						console.log("Completed");
						process.exit();
					  }
					  else{
						console.log("Failed ("+val.status+")");
						process.exit();
					  }


							})
						}
					  }
					}else{
					  console.log("Unknown Error ("+err+")");
					  process.exit();
					}
				});
			}else{
                console.log("invalid command : "+command);
                process.exit();
            }
