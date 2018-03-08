pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract NameRegistry is Ownable {

  event NoEntry(string entry);
  event EntryFound(string entry,address adr);
  event EntrySet(string entry,address adr);

  mapping(string => address) names;
  
  //TODO revert or return 0 ???
  function getAddress(string name) constant returns(address){
      if(names[name]==address(0)){
        NoEntry(name);
        return address(0);
        revert();
      }
      else{
    //    EntryFound(name, names[name]);
        return names[name];
      }
  }
  
  function setAddress(string name,address _adr) onlyOwner public{
    if(_adr==address(0) ){
      revert();
    }
    names[name] = _adr;
//    EntrySet(name, names[name]);
  }
}
