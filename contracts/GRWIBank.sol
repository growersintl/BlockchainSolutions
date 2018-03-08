pragma solidity ^0.4.4;

import './GRWIBankAccount.sol';

contract GRWIBank {

    address public owner ;
    address private operator ;
    NameRegistry private registry;
	GRWIBankAccount[] private availableAddresses;
    mapping(uint256 => address) private assignments ;
	

    uint256 public firstFreeAddressIndex = 0;
    
    modifier onlyTrusted{
        if(msg.sender == owner || msg.sender == operator){
            _;
        }
        else{
            revert();
        }
    }
    
    function getToken() public constant returns(address){
        return registry.getAddress("GRWIToken");
    }

    function changeOperatorAccount(address addr) onlyTrusted public{
        if(msg.sender==owner){
            operator = addr;
        }
    }    
    function changeOwner(address newOwner) onlyTrusted public{
        if(msg.sender==owner){
            owner = newOwner;
        }
        else{
          revert();   
        
        }
    }
    function GRWIBank(address _registry)  public{
        registry = NameRegistry(_registry);
        owner = msg.sender;
    }	
    function createNewAccount() onlyTrusted internal{
        var a = new GRWIBankAccount(getToken());
        availableAddresses.push(a);
    }
    function lock(uint256 addressId) onlyTrusted public {
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        b.lock();
    }
    function unlock(uint256 addressId,uint256 _lockedAmount) onlyTrusted public{
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        b.unlock(_lockedAmount);
    }
    function getAmount(uint256 addressId) constant onlyTrusted public returns(uint256){
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        return b.getAmount();
    }
    function isLocked(uint256 addressId) constant onlyTrusted public returns(bool){
        GRWIBankAccount b = GRWIBankAccount(assignments[addressId]);
        return b.isLocked();
    }
    
    function getAvailableAddressesCount() private constant onlyTrusted returns(uint256){
        return availableAddresses.length-firstFreeAddressIndex;
    }
    
    function assignMultipleAddresses(uint256 startHolderId,uint256 endHolderId) onlyTrusted public{
        require(startHolderId<=endHolderId);
        for(uint256 i = startHolderId; i<endHolderId ; i++){
          if(getAvailableAddressesCount()==0){
            createNewAccount();
          }
          assignments[i] = availableAddresses[firstFreeAddressIndex];
          firstFreeAddressIndex++;
        }
    }
    
    function bindWithWithdrawAccount(uint256 holderId, address sendBackAddress){
      (GRWIBankAccount(assignments[holderId])).setWithdrawAddress(sendBackAddress);
    }
    
    function assignAddress(uint256 holderId) public{
        if(msg.sender==owner || msg.sender==operator){
            if(assignments[holderId]!=0){ // nie można stworzyć 2 adresów dla jednego klienta
    
            }
            else{
                if(getAvailableAddressesCount()==0){
                        createNewAccount();
                }
                assignments[holderId] = availableAddresses[firstFreeAddressIndex];
                firstFreeAddressIndex = firstFreeAddressIndex+1;
            }
        }
        else{
          revert();   
        
        }

    }
    function getAssignedAddress(uint256 holderId) public constant returns(address){
         return assignments[holderId];
    }
}
