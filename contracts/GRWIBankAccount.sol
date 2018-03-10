pragma solidity ^0.4.19;
import './NameRegistry.sol';


contract ForeignToken {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
}

//contract by Adam Skrodzki
contract GRWIBankAccount {
	address private _withdraw;
	bool isLockedFlag;
	uint256 lockedAmount ;
	NameRegistry private registry;
	
	modifier onlyBank{
	    if(msg.sender!=address(getBank())){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
	modifier onlyBankOrWithdraw{
	    if(msg.sender!=address(getBank()) && msg.sender!=_withdraw){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
    function getToken() public constant returns(ForeignToken){
        return ForeignToken(registry.getAddress("GRWIToken"));
    }
	
    function getBank() public constant returns(ForeignToken){
        return ForeignToken(registry.getAddress("GRWIBank"));
    }
	
	function GRWIBankAccount(address _registry) public{
	    registry = NameRegistry(_registry);
	    
	}
	
	function withdraw() public onlyBankOrWithdraw returns(bool){
	  return(getToken().transfer(_withdraw,getToken().balanceOf(this)));
	}
	
	function setWithdrawAddress(address _adr) public onlyBank{
	    _withdraw = _adr;
	}
	
	function lock() public onlyBank{
	    if(isLockedFlag==false){
	        isLockedFlag = true;
	        lockedAmount = getToken().balanceOf(this);
	    }
	    else{
	      revert();
	    }
	}
	
	function isLocked() public constant returns(bool){
	    return isLockedFlag;
	}
	
	function getAmount() public constant returns(uint256){
	    return lockedAmount;
	}
	
	
	function unlock(uint256 _lockedAmount) public onlyBank{
	    if(isLockedFlag && lockedAmount == _lockedAmount){
	        getToken().transfer(getBank(),lockedAmount);
	        lockedAmount = 0;
	        isLockedFlag = false;
	    }
	    else{
	        revert();
	    }
	}
	
	function () public onlyBank {
	
	
	}
	
}