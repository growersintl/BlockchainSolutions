pragma solidity ^0.4.4;

import './GRWIBankAccount.sol';

contract GRWIBankAccountInterface is GRWIBankAccount{
    
	function unlock(uint256 _lockedAmount) public;
	function setWithdrawAddress(address _adr) public;
	function lock() public;
	function withdraw() public;
}

contract GRWIBank {

    address private libraryAddr ;
    address public owner ;
    address public operator ;
    NameRegistry public registry;
	GRWIBankAccount[] private availableAddresses;
    mapping(uint256 => address) private assignments ;
	

    uint256 public firstFreeAddressIndex = 0;
    
    modifier onlyTrusted(address adr){
        require(adr == owner || adr == operator);
        _;
    }
    
    modifier onlyNew(uint256 holder){
        require(assignments[holder]==address(0));
        _;
    }
    
    function getToken() public constant returns(address){
        return registry.getAddress("GRWIToken");
    }

    function setLibrary(address addr) onlyTrusted(msg.sender) public{
        libraryAddr = addr;
    }   
    
    function changeOperatorAccount(address addr) onlyTrusted(msg.sender) public{
        operator = addr;
    }    
    function changeOwner(address newOwner) onlyTrusted(msg.sender) public{
        owner = newOwner;
    }
    function GRWIBank(address _registry)  public{
        registry = NameRegistry(_registry);
        owner = msg.sender;
    }	
    function createNewAccount() onlyTrusted(msg.sender) internal{
        var a = new GRWIBankAccount(registry,libraryAddr);
        availableAddresses.push(a);
    }
    function lock(uint256 addressId) onlyTrusted(msg.sender) public {
       GRWIBankAccountInterface b = GRWIBankAccountInterface(assignments[addressId]);
       b.lock();
    }
    function unlock(uint256 addressId,uint256 _lockedAmount) onlyTrusted(msg.sender) public{
        GRWIBankAccountInterface b = GRWIBankAccountInterface(assignments[addressId]);
        b.unlock(_lockedAmount);
    }
    function getAmount(uint256 addressId) constant onlyTrusted(msg.sender) public returns(uint256){
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        uint256 amount;
        (,,amount,)= b.data();
        return amount;
    }
    function isLocked(uint256 addressId) constant onlyTrusted(msg.sender) public returns(bool){
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        bool isLocked;
        (,isLocked,,)= b.data();
        return isLocked;
    }
    
    function getAvailableAddressesCount() private constant onlyTrusted(msg.sender) returns(uint256){
        return availableAddresses.length-firstFreeAddressIndex;
    }
    
    function assignMultipleAddresses(uint256 startHolderId,uint256 endHolderId) onlyTrusted(msg.sender) public{
        require(startHolderId<=endHolderId);
        for(uint256 i = startHolderId; i<=endHolderId ; i++){
          if(getAvailableAddressesCount()==0){
            createNewAccount();
          }
          assignments[i] = availableAddresses[firstFreeAddressIndex];
          firstFreeAddressIndex++;
        }
    }
    
    function bindWithWithdrawAccount(uint256 holderId, address sendBackAddress) onlyTrusted(msg.sender) public{
      (GRWIBankAccountInterface(assignments[holderId])).setWithdrawAddress(sendBackAddress);
    }
    
    function withdraw(uint256 holderId, address sendBackAddress) onlyTrusted(msg.sender) public{
      (GRWIBankAccountInterface(assignments[holderId])).withdraw();
    }
    
    function assignAddress(uint256 holderId) onlyTrusted(msg.sender) onlyNew(holderId) public{
       if(getAvailableAddressesCount()==0){
            createNewAccount();
        }
        assignments[holderId] = availableAddresses[firstFreeAddressIndex];
        firstFreeAddressIndex = firstFreeAddressIndex+1;
    }
    
    function getAssignedAddress(uint256 holderId) public constant returns(address){
         return assignments[holderId];
    }
}
