import latestTime from 'zeppelin-solidity/test/helpers/latestTime';
import { advanceBlock } from 'zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from 'zeppelin-solidity/test/helpers/increaseTime';
const NameRegistry = artifacts.require('NameRegistry');
const GRWITokenSwaper = artifacts.require('GRWITokenSwaper');
const ERC20BasicTokenMock = artifacts.require('ERC20BasicTokenMock');

  var assertRevert= async function(promise){
      
      try {
        await promise;
        assert.fail('Expected revert not received');
      } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
      }
  }
  
  var tenBN = new web3.BigNumber(10);
  
  contract('GRWITokenSwaper', function ([sysAddr, ownerAddr, otherAddr1, otherAddr2]) {
       var data = {};
 
          const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
		  
		  var moveTimeForward = async function(delay){
			  
				var startTime = latestTime();
				await increaseTimeTo(startTime+delay);
				var endTime = latestTime();
				assert(endTime-startTime>=delay,'Time not moved forward');
		  }
          beforeEach(async function () {
			  
              data.registry = await NameRegistry.new();
              data.token = await ERC20BasicTokenMock.new();
			  data.swapper = await GRWITokenSwaper.new(data.registry.address);
              await data.swapper.init(ownerAddr,data.token.address);
			  await data.token.transfer(data.swapper.address,"1200000"+"00000000",{gasPrice:"0"});
          });
                    
          describe('claimTokens', function () {
			  
            it('should reject claim without 0.003 ether deposit', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"0"});
				assertRevert(promise);
            });
			
            it('should allow claim tokens once with 0.003 eth deposit', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
            });
            it('should reject claiming tokens twice', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				var promise  =  data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				assertRevert(promise);
            });
            it('should allow claim tokens after previous claim completed', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				var promise  = data.swapper.executeClaim(otherAddr1);
				await promise;
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
            });
            it('should allow claim tokens after previous claim rejectedd', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				var promise  = data.swapper.rejectClaim(otherAddr1,false,{from:ownerAddr});
				await promise;
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
            });
            it('should emit ClaimMade event', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				var {logs} = await promise;
				assert(logs[0].event==="ClaimMade",'incorrect event name');
            });
          });    
          
          describe('rejectClaim', function () {
            it('should deny rejection of existing claim by not owner', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				var promise2  = data.swapper.rejectClaim(otherAddr1,true,{from:otherAddr1});
				assertRevert(promise2);
            });
            it('should allow rejection of existing pending claim by owner', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				var promise2  = await data.swapper.rejectClaim(otherAddr1,true,{from:ownerAddr});
            });
            it('should deny rejection of existing completed claim by owner', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				await data.swapper.executeClaim(otherAddr1);
				var promise2  = data.swapper.rejectClaim(otherAddr1,true,{from:ownerAddr});
				assertRevert(promise2);
				
            });
            it('should deny rejection of existing rejected claim by owner', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await data.swapper.rejectClaim(otherAddr1,true,{from:ownerAddr});
				var promise2  =  data.swapper.rejectClaim(otherAddr1,true,{from:ownerAddr});
				assertRevert(promise2);
            });
            it('should emit RejectAndPunish if punishment true', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				var promise2  = data.swapper.rejectClaim(otherAddr1,true,{from:ownerAddr});
				var {logs} = await promise2;
				assert(logs[0].event==="RejectAndPunish",'incorrect event name');
            });
            it('should emit RejectClaim if punishment false', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				var promise2  = data.swapper.rejectClaim(otherAddr1,false,{from:ownerAddr});
				var {logs} = await promise2;
				assert(logs[0].event==="RejectClaim",'incorrect event name');
            });
          });
          
                 
          describe('executeClaim', function () {
            it('should deny execution if no claim', async function () {
				var promise  = data.swapper.executeClaim(otherAddr1);
				assertRevert(promise);
				
            });
            it('should deny execution if timespan to short', async function () {
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(500000);
				var promise  = data.swapper.executeClaim(otherAddr1);
				assertRevert(promise);
				
            });
            it('should deny execution if claim not pending', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				await data.swapper.executeClaim(otherAddr1);
				
				var promise  = data.swapper.executeClaim(otherAddr1);
				assertRevert(promise);
            });
            it('should return deposit on accepted claim', async function () {
				
				var startBalance = await web3.eth.getBalance(otherAddr1);
				var promise  = data.swapper.claimTokens(otherAddr1,"15000",{from:otherAddr1,value:"3000000000000000",gasPrice:0});
				await promise;
				var midBalance = await web3.eth.getBalance(otherAddr1);
				await moveTimeForward(660000);
				await data.swapper.executeClaim(otherAddr1,{from:otherAddr1,gasPrice:0});
				var endBalance = await web3.eth.getBalance(otherAddr1);
				assert(startBalance.toString()===endBalance.toString(),'not all returned');
				assert((startBalance-midBalance).toString()==="3000000000000000",'balance incorrectly decreased');
            });
            it('should return requested amount of tokens on acceptance', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"15000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				await data.swapper.executeClaim(otherAddr1);
				var balance = await data.token.balanceOf(otherAddr1);
				var dec = tenBN.pow(await data.token.DECIMALS());
				var sum = balance.toString()
				var expectedSum =(dec*15).toString();
				assert(expectedSum===sum,'incorrect sum');
				
            });
            it('should emit ExecuteClaim if punishment false', async function () {
				
				var promise  = data.swapper.claimTokens(otherAddr1,"1000",{from:otherAddr1,value:"3000000000000000"});
				await promise;
				await moveTimeForward(660000);
				var {logs} = await data.swapper.executeClaim(otherAddr1);
				assert(logs[0].event==="ExecuteClaim",'incorrect event name');
            });
          });
          
  });