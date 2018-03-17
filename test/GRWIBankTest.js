import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
const GRWIBank = artifacts.require('GRWIBank');
const GRWIBankAccount = artifacts.require('GRWIBankAccount');
const NameRegistry = artifacts.require('NameRegistry');
const ForeignTokenMock = artifacts.require('ForeignTokenMock');

  var assertRevert= async function(promise){
      
      try {
        await promise;
        assert.fail('Expected revert not received');
      } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
      }
  }
  
  contract('GRWIBank', function ([ownerAddr, operatorAddr, otherAddr1, otherAddr2]) {
       var data = {};
 
          const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
          beforeEach(async function () {
              data.registry = await NameRegistry.new();
              data.bank = await GRWIBank.new(data.registry.address);
              await data.bank.changeOperatorAccount(operatorAddr);
              data.token = await ForeignTokenMock.new();
              await data.registry.setAddress("GRWIToken",data.token.address);
              await data.registry.setAddress("GRWIBank",data.bank.address);
              
          });
                      
          describe('changeOwner', function () {
            it('should fail if called by not trusted', async function () {
                var promise = data.bank.changeOwner(otherAddr2,{from:otherAddr1});
                return assertRevert(promise);
            });
            it('should pass if called by owner', async function () {
                var promise = data.bank.changeOwner(otherAddr2,{from:ownerAddr});
                return await promise;
            });
            it('should pass if called by operatorAddr', async function () {
                var promise = data.bank.changeOwner(otherAddr2,{from:operatorAddr});
                return await promise;
            });
          });    
          
          describe('changeOperatorAccount', function () {
            it('should fail if called by not trusted', async function () {
                var promise = data.bank.changeOperatorAccount(otherAddr2,{from:otherAddr1});
                return assertRevert(promise);
            });
            it('should pass if called by owner', async function () {
                var promise = data.bank.changeOperatorAccount(otherAddr2,{from:ownerAddr});
                return await promise;
            });
            it('should pass if called by operator', async function () {
                var promise = data.bank.changeOperatorAccount(otherAddr2,{from:operatorAddr});
                return await promise;
            });
          });
          
                 
          describe('assignAddress', function () {
            it('should fail if called by not owner', async function () {
                var promise = data.bank.assignAddress(2,{from:otherAddr1});
                return assertRevert(promise);
            });
            it('should pass if called by owner', async function () {
                var promise = data.bank.assignAddress(2,{from:ownerAddr});
                return await promise;
            });
            it('should pass if called by operator', async function () {
                var promise = data.bank.assignAddress(2,{from:operatorAddr});
                return await promise;
            });
            it('should fail if called by owner twice with same Id', async function () {
                var promise = data.bank.assignAddress(2,{from:ownerAddr}).then(function(){
                  return data.bank.assignAddress(2,{from:ownerAddr});
                });
                return assertRevert(promise);
            });
          });
          
          
          describe('getAssignedAddress', function () {
            it('should return 0 if called on not created Id', async function () {
                var result = await data.bank.getAssignedAddress(2,{from:ownerAddr});
                return assert.equal(result,"0x0000000000000000000000000000000000000000");
            });
            it('should return not 0 if called on created Id', async function () {
                await data.bank.assignAddress(2,{from:ownerAddr});
                var result = await data.bank.getAssignedAddress(2,{from:ownerAddr});
                return assert.isFalse(result==="0x0000000000000000000000000000000000000000");
            });
            it('should return different Adresses on different Id\'s', async function () {
                await data.bank.assignAddress(2,{from:ownerAddr});
                await data.bank.assignAddress(3,{from:ownerAddr});
                var result = await data.bank.getAssignedAddress(2,{from:ownerAddr});
                var result2 = await data.bank.getAssignedAddress(3,{from:ownerAddr});
                return assert.isFalse(result===result2);
            });
          });
        
          describe('lock', function () {
            beforeEach(async function () {
               await data.bank.assignAddress(2,{from:ownerAddr});
            });
            it('should fail if called by not owner', async function () {
                var promise = data.bank.lock(2,{from:otherAddr1});
                return assertRevert(promise);
            });
            it('should pass if called by owner', async function () {
                var promise = data.bank.lock(2,{from:ownerAddr});
                return await promise;
            });
            it('should pass if called by operator', async function () {
                var promise = data.bank.lock(2,{from:operatorAddr});
                return await promise;
            });
            it('should fail if called by owner twice with same Id', async function () {
                var promise = data.bank.lock(2,{from:ownerAddr}).then(function(){
                  return data.bank.assignAddress(2,{from:ownerAddr});
                });
                return assertRevert(promise);
            });
          });
          
      
          describe('bindWithWithdrawAccount', function () {
              var adr2 = undefined;
            beforeEach(async function () {
               await data.bank.assignAddress(2,{from:ownerAddr});
               adr2 = await data.bank.getAssignedAddress(2,{from:ownerAddr});
            });
            it('should fail if called by not owner', async function () {
                var promise = data.bank.bindWithWithdrawAccount(2,otherAddr2,{from:otherAddr1});
                return assertRevert(promise);
            });
            it('should pass if called by owner', async function () {
                var promise = data.bank.bindWithWithdrawAccount(2,otherAddr2,{from:ownerAddr});
                return await promise;
            });
            it('should pass if called by operator', async function () {
                var promise = data.bank.bindWithWithdrawAccount(2,otherAddr2,{from:operatorAddr});
                return await promise;
            });
            it('should pass if called by operator', async function () {
                var promise = data.bank.bindWithWithdrawAccount(2,otherAddr2,{from:operatorAddr});
                return await promise;
            });
            it('should update withdraw property', async function () {
                await data.bank.bindWithWithdrawAccount(2,otherAddr2,{from:operatorAddr});
                var info = await GRWIBankAccount.at(adr2).data();
                assert.equal(info[0],otherAddr2,'withdraw address should be set to '+otherAddr2);
                return true;
            });
          });
  });