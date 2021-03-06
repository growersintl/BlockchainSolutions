pragma solidity ^0.4.19;
import './NameRegistry.sol';
import './ForeignTokenI.sol';


contract GRWIBankAccountLibrary {
	struct GRWIData{
		address  _withdraw;
		bool  isLockedFlag;
		uint256  lockedAmount ;
		NameRegistry  registry;
	}
	
	
    event Lock(bool _isLocked ,address adr);
	
	
	GRWIBankAccountLibrary.GRWIData public data;
	
	modifier onlyBank(){
	    if(msg.sender!=getBank()){
	        revert();
	    }
	    else{
	        _;
	   }
	}
	
	modifier onlyBankOrWithdraw(){
	    if(msg.sender!=getBank() && msg.sender!=data._withdraw){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
	function lock() public onlyBank(){
		Lock(data.isLockedFlag,address(this));
	    if(data.isLockedFlag==false){
	        data.isLockedFlag = true;
	        data.lockedAmount = ForeignTokenI(getToken()).balanceOf(this);
	    }
	    else{
	      revert();
	    }
	}
	
	function setWithdrawAddress(address _adr) public onlyBank() {
	    data._withdraw = _adr;
	}
	
	function unlock(uint256 _lockedAmount) public onlyBank() {
	    if(data.isLockedFlag && data.lockedAmount == _lockedAmount){
	        ForeignTokenI(getToken()).transfer(getBank(),data.lockedAmount);
	        data.lockedAmount = 0;
	        data.isLockedFlag = false;
	    }
	    else{
	        revert();
	    }
	}
	
	function withdraw() public onlyBankOrWithdraw() returns(bool){
	  require(ForeignTokenI(getToken()).transfer(data._withdraw,ForeignTokenI(getToken()).balanceOf(this)));
	  return true;
	 }
	  
    function getToken() constant returns(address){
        return data.registry.getAddress("GRWIToken");
    }
	
    function getBank() constant returns(address){
        return data.registry.getAddress("GRWIBank");
    }
    
    function () public {
    	revert();
    }
}
