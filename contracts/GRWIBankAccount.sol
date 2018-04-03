pragma solidity ^0.4.19;
import './NameRegistry.sol';
import './GRWIBankAccountLibrary.sol';

contract GRWIBankAccount {
	
	GRWIBankAccountLibrary.GRWIData public data;
	address private libraryAddr;
	
	
	function GRWIBankAccount(address _registry,address _lib) public{
	    data.registry = NameRegistry(_registry);
	    libraryAddr = _lib;
	}
	
	function () public  {
        if(libraryAddr.delegatecall(msg.data)==false){
        	revert();
        }
	}
	
}