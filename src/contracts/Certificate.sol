pragma solidity ^0.4.0;
contract Certificate {

  enum CertificateType{
    PoA,Audit
  }

  struct CertificateDetails{

    CertificateType certificateType;
    string IPFSAddress;
    string certificateID;
  }

  CertificateDetails [] private certificates;

  modifier stringNotEmpty(string _input){
    if(bytes(_input).length >0 ){
      _;
    }
  }

  modifier validCertificateIndex(uint256 _index){
    if(_index >=0 && _index < certificates.length){
      _;
    }
  }

  event CertificateAdded(CertificateType  cType,string  IPFS, string  ID);

  function registerProofOfAsset(string _IPFSAddress,string _certificateID) external stringNotEmpty(_IPFSAddress) stringNotEmpty(_certificateID)  {
    certificates.push(CertificateDetails({ certificateType : CertificateType.PoA, IPFSAddress : _IPFSAddress, certificateID : _certificateID}));
    CertificateAdded(CertificateType.PoA,_IPFSAddress,_certificateID);
  }


  function registerAuditReport(string _IPFSAddress,string _reportID) external stringNotEmpty(_IPFSAddress) stringNotEmpty(_reportID){
    certificates.push(CertificateDetails({ certificateType : CertificateType.Audit, IPFSAddress : _IPFSAddress, certificateID : _reportID}));
    CertificateAdded(CertificateType.Audit,_IPFSAddress,_reportID);

  }


  function getCertificateDetailsByIndex(uint256 index) validCertificateIndex(index) constant external returns (CertificateType,string,string){
      return(certificates[index].certificateType,certificates[index].IPFSAddress,certificates[index].certificateID);
  }

  function getNumberOfCertificates() constant external returns(uint256){
    return (certificates.length);
  }

}
