pragma solidity ^0.4.19;
import './NameRegistry.sol';

contract ForeignToken {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
}

library GRWIBankAccountLibrary {
	struct GRWIData{
		address  _withdraw;
		bool  isLockedFlag;
		uint256  lockedAmount ;
		NameRegistry  registry;
	}
	
	modifier onlyBank(GRWIData storage data){
	    if(msg.sender!=getBank(data)){
	        revert();
	    }
	    else{
	        _;
	   }
	}
	
	modifier onlyBankOrWithdraw(GRWIData storage data){
	    if(msg.sender!=getBank(data) && msg.sender!=data._withdraw){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
	function lock(GRWIData storage data) public onlyBank(data){
	    if(data.isLockedFlag==false){
	        data.isLockedFlag = true;
	        data.lockedAmount = ForeignToken(getToken(data)).balanceOf(this);
	    }
	    else{
	      revert();
	    }
	}
	
	function setWithdrawAddress(GRWIData storage data,address _adr) public onlyBank(data){
	    data._withdraw = _adr;
	}
	
	function unlock(GRWIData storage data,uint256 _lockedAmount) public onlyBank(data){
	    if(data.isLockedFlag && data.lockedAmount == _lockedAmount){
	        ForeignToken(getToken(data)).transfer(getBank(data),data.lockedAmount);
	        data.lockedAmount = 0;
	        data.isLockedFlag = false;
	    }
	    else{
	        revert();
	    }
	}
	
	function withdraw(GRWIData storage data) public onlyBankOrWithdraw(data) returns(bool){
	  require(ForeignToken(getToken(data)).transfer(data._withdraw,ForeignToken(getToken(data)).balanceOf(this)));
	  return true;
	 }
	  
    function getToken(GRWIData storage data) constant returns(address){
        return data.registry.getAddress("GRWIToken");
    }
	
    function getBank(GRWIData storage data) constant returns(address){
        return data.registry.getAddress("GRWIBank");
    }
}
