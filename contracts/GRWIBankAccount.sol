pragma solidity ^0.4.19;
import './NameRegistry.sol';
import './GRWIBankAccountLibrary.sol';

contract GRWIBankAccount {
	
	using GRWIBankAccountLibrary for GRWIBankAccountLibrary.GRWIData;
	
	GRWIBankAccountLibrary.GRWIData public data;
	
	
	
	function GRWIBankAccount(address _registry) public{
	    data.registry = NameRegistry(_registry);
	    
	}
	
	function withdraw() public returns(bool){
		return data.withdraw();
	}
	
	function lock() public{
	    data.lock();
	}
	
	function setWithdrawAddress(address _adr) public{
	    data.setWithdrawAddress(_adr);
	}
	
	function isLocked() public constant returns(bool){
	    return data.isLockedFlag;
	}
	
	function getAmount() public constant returns(uint256){
	    return data.lockedAmount;
	}
	
	
	function unlock(uint256 _lockedAmount) public{
		return data.unlock(_lockedAmount);
	}
	/*
	function () public onlyBank {
        msg.sender.delegatecall(msg.data);
	}
	*/
}