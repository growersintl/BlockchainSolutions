var GRWIBank = artifacts.require("./GRWIBank.sol");
var GRWIBankAccount = artifacts.require("./GRWIBankAccount.sol");
var NameRegistry = artifacts.require("./NameRegistry.sol");

module.exports = function(deployer) {
    var tokenAddress = "0x516208af5a9ecb6fb3c09a4d918884bcc08992ed";
    var nameRegistryAddress = "";
    var registry = undefined;
    var bankCtrct = undefined;
    deployer.deploy(NameRegistry).then(function(){
        return NameRegistry.deployed().then(function(reg){
            
            nameRegistryAddress = reg.address;
            registry = reg;
            return reg.setAddress("GRWIToken","0x516208af5a9ecb6fb3c09a4d918884bcc08992ed");
        })
    }).then(function(){
        return deployer.deploy(GRWIBank,registry.address).then(function(){
            return  GRWIBank.deployed().then(function(bank){
                bankCtrct = bank;
                console.log("setBank");
                return registry.setAddress("Bank",bank.address);
            }).then(function(){
                console.log("setBank done");
            }).then(function(){
                console.log("setBank done");
                return bankCtrct.assignAddress(1);
            }).then(function(){
                console.log("setBank done");
                return bankCtrct.assignAddress(2);
            }).then(function(){
                return bankCtrct.assignMultipleAddresses(3,12);
            });
        });
    });
};
