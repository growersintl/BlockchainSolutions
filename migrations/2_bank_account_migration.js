var GRWIBank = artifacts.require("./GRWIBank.sol");
var GRWIBankAccount = artifacts.require("./GRWIBankAccount.sol");
var ForeignTokenI = artifacts.require("./ForeignTokenI.sol");
var GRWITokenSwaper = artifacts.require("./GRWITokenSwaper.sol");
var GRWIBankAccountLibrary = artifacts.require("./GRWIBankAccountLibrary.sol");
var NameRegistry = artifacts.require("./NameRegistry.sol");

module.exports = function(deployer,network,accounts) {
    var tokenAddress = "0xc8455373f7848d1517f4206a21e8fb6b8a6dec69";//will change
    var ownerAddress = accounts[0];//will change
    var registry = undefined;
    var bankCtrct = undefined;
    var libraryCtrct = undefined;
    deployer.deploy(GRWIBankAccountLibrary).then(function() {
        return GRWIBankAccountLibrary.deployed();
    }).then(function(lib){
        libraryCtrct = lib.address;
    }).then(
        function(){
            return deployer.deploy(NameRegistry).then(function(){
                return NameRegistry.deployed().then(function(reg){
                    
                    registry = reg;
                    return reg.setAddress("GRWIToken",tokenAddress);
                })
            }).then(function(){
                return deployer.deploy(GRWIBank,registry.address).then(function(){
                    return  GRWIBank.deployed().then(function(bank){
                        return bank.changeOperatorAccount("0x5b55c7ec3bd128e46f0820e1daa491aed896b8c5").then(function(){
                            bankCtrct = bank;
                            return bank.setLibrary(libraryCtrct).then(function(){
                                return registry.setAddress("GRWIBank",bank.address);
                            });
                        });
                    }).then(function(){
                        return deployer.deploy(GRWITokenSwaper,registry.address).then(function() {
                            console.log('GRWITokenSwaper done');
                            return GRWITokenSwaper.deployed().then(function(swaper){
                                return swaper.init(ownerAddress).then(function(){
                                    var tCntrct = ForeignTokenI.at(tokenAddress);
                                    return tCntrct.balanceOf(accounts[0]).then(function(amount){
                                        console.log('GRWITokenSwaper init '+amount);
                                        return tCntrct.transfer(swaper.address,amount)
                                    });;
                                }).then(function(){
                                    console.log('GRWITokenSwaper supplied with tokens');
                                    console.log('deploy done');
                                });
                                
                            });
                        })
                    });
                });
            });
        });
};
