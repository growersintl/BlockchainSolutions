pragma solidity ^0.4.19;

contract ForeignTokenI {
    function balanceOf(address _owner) constant returns (uint256);
    function transfer(address _to, uint256 _value) returns (bool);
	function DECIMALS() constant public returns(uint256);
}