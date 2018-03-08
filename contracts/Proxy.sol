
contract Proxy {
    function () external {
        // return Real(0x0000005E1CBE78009143B44D717423cb01a002B7).delegatecall(msg.data);
        assembly {
            calldatacopy(0, 0, calldatasize)
            let _retVal := delegatecall(sub(gas,740), 0x0000005E1CBE78009143B44D717423cb01a002B7, 0, calldatasize, 0, 32) 
            switch _retVal case 0 { revert(0,returndatasize) } default { return(0, returndatasize) }
        }   
    }
}