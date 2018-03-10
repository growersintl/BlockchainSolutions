
contract ForeignTokenMock {
    function balanceOf(address _owner) constant returns (uint256){
        return 42;
    }
    function transfer(address _to, uint256 _value) returns (bool){
        return true;
    }
}