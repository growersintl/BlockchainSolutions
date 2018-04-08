pragma solidity ^0.4.19;
import './NameRegistry.sol';
import './ForeignTokenI.sol';


contract GRWIBankI{
	function isAddressOccupied(address _test) constant public returns(bool);
}


contract GRWITokenSwaper  {

	ForeignTokenI token;
	GRWIBankI bank;
	address public owner;
	uint8 decimals;
	
	modifier onlyOwner {
		require(msg.sender==owner);
		_;
	}
	
	struct Claim {
		address beneficiary;
		uint64 tokensAmount;//Amount of GRWI in millis (for example if You own 500 old grwi You should Claim 500000
		uint16 claimTime; // single tick equals 65536 seconds ~ 18.2 hours we require 9 ticks confirmation time  ~ 7 days
		uint8  claimStatus; // 0 - requested, 1-accepted, 2-rejected
	}
	
	struct BeneficiaryInfo{
		uint64 claimIndex;
		uint64 totalTokenAmount;
	}
	
	Claim[] public requests ;
	NameRegistry registry;
	mapping (address=>BeneficiaryInfo) public userRequests;
	
	function GRWITokenSwaper(address _nameReg) public{
		registry = NameRegistry(_nameReg);
	}
	
	function init(address _owner) public{
		require(address(registry)!=address(0));
	    token = ForeignTokenI(registry.getAddress("GRWIToken"));
	    decimals = uint8(token.DECIMALS());
	    bank = GRWIBankI(registry.getAddress("GRWIBank"));
	    owner = _owner;
	}
	
	function claimTokens(address _beneficiaryAddress,uint64 tokenAmount) public payable{
		require(msg.value==3 finney);
		require(bank.isAddressOccupied(_beneficiaryAddress)==true);
		require(userRequests[msg.sender].claimIndex==0);
		uint64 idx = userRequests[msg.sender].claimIndex ;
		requests.push(Claim(_beneficiaryAddress,tokenAmount,uint16(uint32(now)/2^16),0));
		userRequests[msg.sender].claimIndex = uint64(requests.length-1);
	    ClaimMade(idx,requests[idx].beneficiary,requests[idx].tokensAmount);
	}
	
	function rejectClaim(address _sender,bool punish) public onlyOwner{
		uint64 idx = userRequests[_sender].claimIndex ;
		require(idx>0);
		require(requests[idx].claimStatus==0);
		userRequests[_sender].claimIndex=0;
	    requests[idx].claimStatus=2;
	    if(punish){
			RejectAndPunish(idx,requests[idx].beneficiary,requests[idx].tokensAmount);
	    }
	    else{
			RejectClaim(idx,requests[idx].beneficiary,requests[idx].tokensAmount);
	    }
	}
	
	function executeClaim() public {
		uint64 idx = userRequests[msg.sender].claimIndex ;
		require(canExecute());
		token.transfer(requests[idx].beneficiary,requests[idx].tokensAmount*uint256(10)**(decimals-3));
	    requests[idx].claimStatus=1;
		userRequests[msg.sender].claimIndex=0;
	    ExecuteClaim(idx,requests[idx].beneficiary,requests[idx].tokensAmount);
		msg.sender.transfer(3 finney);
	}
	
	function canExecute() public constant returns(bool){
		bool result = true;
		uint64 idx = userRequests[msg.sender].claimIndex ;
		result = result && (idx > 0);
		result = result && (uint16(uint32(now)/2^16)-requests[idx].claimTime>9);
		result = result && (requests[idx].claimStatus==0);
		return result;
	}
	
	event ClaimMade(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount );
	event ExecuteClaim(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
	event RejectClaim(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
	event RejectAndPunish(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
}