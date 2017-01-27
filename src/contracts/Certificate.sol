pragma solidity ^0.4.0;
contract Certificate {

  enum CertificateType{
    PoA,Audit
  }

  struct CertificateDetails{

    CertificateType certificateType;
    bytes32 IPFSAddress;
    bytes32 certificateID;

  }

  CertificateDetails [] certificates;

  function registerProofOfAsset(bytes32 _IPFSAddress,bytes32 _certificateID) external {
    certificates.push(CertificateDetails({ certificateType : CertificateType.PoA, IPFSAddress : _IPFSAddress, certificateID : _certificateID}));
  }


  function registerAuditReport(bytes32 _IPFSAddress,bytes32 _reportID) external {
    certificates.push(CertificateDetails({ certificateType : CertificateType.Audit, IPFSAddress : _IPFSAddress, certificateID : _reportID}));
  }

  function getAllCertificates() constant external returns (bytes32 [] ,bytes32 []  ){
   bytes32 [] memory ID = new bytes32[](certificates.length);
   bytes32 [] memory IPFS = new bytes32[](certificates.length);
   for (uint256 ii=0;ii<certificates.length;ii++){
      ID[ii] = certificates[ii].certificateID;
      IPFS[ii] = certificates[ii].IPFSAddress;
    }
    return (ID,IPFS);
  }

  function getCertificateDetailsByIndex(uint256 index) constant external returns (CertificateType,bytes32,bytes32){
      return(certificates[index].certificateType,certificates[index].IPFSAddress,certificates[index].certificateID);
  }

  function getNumberOfCertificates() constant external returns(uint256){
    return (certificates.length);
  }

}
