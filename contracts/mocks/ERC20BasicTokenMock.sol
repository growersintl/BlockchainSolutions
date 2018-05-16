import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract ERC20BasicTokenMock  is MintableToken{
	
	string public constant name = "GRWI TEST";
	string public constant symbol = "TEST";
	uint256 public constant DECIMALS = 8;
	uint256 public constant decimals = 8;

	function ERC20BasicTokenMock(){
		owner = msg.sender;
		super.mint(owner,1200000*(10**DECIMALS));
	}
}