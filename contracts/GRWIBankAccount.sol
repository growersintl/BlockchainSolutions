pragma solidity ^0.4.19;


contract ForeignToken {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
}

//contract by Adam Skrodzki
contract GRWIBankAccount {
    ForeignToken private token;
	address private main;
	address private _withdraw;
	bool isLockedFlag;
	uint256 lockedAmount ;
	
	modifier onlyBank{
	    if(msg.sender!=main){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
	modifier onlyBankOrWithdraw{
	    if(msg.sender!=main && msg.sender!=_withdraw){
	        revert();
	    }
	    else{
	        _;
	    }
	}
	
	function GRWIBankAccount(address _token) public{
	    main = msg.sender;
	    token = ForeignToken(_token);
	    
	}
	
	function withdraw() public onlyBankOrWithdraw returns(bool){
	  return(token.transfer(_withdraw,token.balanceOf(this)));
	}
	
	function setWithdrawAddress(address _adr) public onlyBank{
	    _withdraw = _adr;
	}
	
	function lock() public onlyBank{
	    if(isLockedFlag==false){
	        isLockedFlag = true;
	        lockedAmount = token.balanceOf(this);
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
	        token.transfer(main,lockedAmount);
	        lockedAmount = 0;
	        isLockedFlag = false;
	    }
	    else{
	        revert();
	    }
	}
	
}