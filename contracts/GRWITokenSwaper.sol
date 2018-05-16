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
		uint8  claimStatus; // 1 - requested, 0-accepted, 2-rejected
	}
	
	struct BeneficiaryInfo{
		uint64 claimIndex;
	}
	
	Claim[] public requests ;
	NameRegistry registry;
	mapping (address=>BeneficiaryInfo) public userRequests;
	
	function GRWITokenSwaper(address _nameReg) public{
		registry = NameRegistry(_nameReg);
	}
	
	function init(address _owner,address _tokenAdr) public{
	
		require(address(registry)!=address(0));
		require(owner==address(0));
	    token = ForeignTokenI(_tokenAdr);
	    decimals = uint8(token.DECIMALS());
	//    bank = GRWIBankI(registry.getAddress("GRWIBank"));
	    owner = _owner;
	}
	
	function claimTokens(address _beneficiaryAddress,uint64 tokenAmount) public payable{
		require(msg.value==3 finney);
//		require(bank.isAddressOccupied(_beneficiaryAddress)==true);
		require(userRequests[_beneficiaryAddress].claimIndex==0);
		uint64 idx = userRequests[_beneficiaryAddress].claimIndex ;
		requests.push(Claim(_beneficiaryAddress,tokenAmount,uint16(uint32(now)/2**16),0));
		userRequests[_beneficiaryAddress].claimIndex = uint64(requests.length);
	    requests[idx].claimStatus=1;
	    requests[idx].claimTime=uint16(uint32(now)/(2**16));
	    ClaimMade(idx,requests[idx].beneficiary,requests[idx].tokensAmount);
	}
	
	function rejectClaim(address _sender,bool punish) public onlyOwner{
	
		uint64 idx = userRequests[_sender].claimIndex ;
		require(idx>0);
		require(requests[idx-1].claimStatus==1);
		userRequests[_sender].claimIndex=0;
	    requests[idx-1].claimStatus=2;
		
	    if(punish){
			RejectAndPunish(idx,requests[idx-1].beneficiary,requests[idx-1].tokensAmount);
			owner.transfer(3 finney);
	    }
	    else{
			RejectClaim(idx,requests[idx-1].beneficiary,requests[idx-1].tokensAmount);
			_sender.transfer(3 finney);
	    }
		
	}
	
	function executeClaim(address _beneficiaryAddress) public {
		uint64 idx = userRequests[_beneficiaryAddress].claimIndex ;
		require(canExecute(_beneficiaryAddress));
		token.transfer(requests[idx-1].beneficiary,requests[idx-1].tokensAmount*(uint256(10)**(decimals-3)));
	    requests[idx-1].claimStatus=0;
		userRequests[_beneficiaryAddress].claimIndex=0;
	    ExecuteClaim(idx,requests[idx-1].beneficiary,requests[idx-1].tokensAmount);
		_beneficiaryAddress.transfer(3 finney);
	}
	
	function canExecute(address _beneficiaryAddress) public constant returns(bool){
		bool result = true;
		uint64 idx = userRequests[_beneficiaryAddress].claimIndex ;
		result = result && (idx > 0);
		result = result && (uint16(uint32(now)/(2**16))-requests[idx-1].claimTime>9);
		result = result && (requests[idx-1].claimStatus==1);
		return result;
	}
	
	event ClaimMade(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount );
	event ExecuteClaim(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
	event RejectClaim(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
	event RejectAndPunish(uint64 indexed claimIdx,address indexed _for, uint64 miliGRWIAmount);
}