var GRWIBank = artifacts.require("./GRWIBank.sol");
var GRWIBankAccount = artifacts.require("./GRWIBankAccount.sol");
var GRWIBankAccountLibrary = artifacts.require("./GRWIBankAccountLibrary.sol");
var NameRegistry = artifacts.require("./NameRegistry.sol");

module.exports = function(deployer) {
    var tokenAddress = "0x516208af5a9ecb6fb3c09a4d918884bcc08992ed";
    var nameRegistryAddress = "";
    var registry = undefined;
    var bankCtrct = undefined;
    deployer.deploy(GRWIBankAccountLibrary).then(function() {
        return GRWIBankAccountLibrary.deployed();
    }).then(function(){
        deployer.link(GRWIBankAccountLibrary, GRWIBank);   
    }).then(
        function(){
            return deployer.deploy(NameRegistry).then(function(){
                return NameRegistry.deployed().then(function(reg){
                    
                    nameRegistryAddress = reg.address;
                    registry = reg;
                    return reg.setAddress("GRWIToken","0x516208af5a9ecb6fb3c09a4d918884bcc08992ed");
                })
            }).then(function(){
                return deployer.deploy(GRWIBank,registry.address).then(function(){
                    return  GRWIBank.deployed().then(function(bank){
                        return bank.changeOperatorAccount("0x5b55c7ec3bd128e46f0820e1daa491aed896b8c5").then(function(){
                            bankCtrct = bank;
                            console.log("setBank");
                            return registry.setAddress("GRWIBank",bank.address);
                        })
                    }).then(function(){
                        return Promise.all([bankCtrct.operator(),bankCtrct.owner()]).then(function(){
                             console.log("setBank done = "+JSON.stringify(arguments));
                        })
                    });
                });
            });
        });
};
