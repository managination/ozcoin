function exchangeToken() {
    return eth.contract(contracts.ExchangeToken.abi).at(contracts.ExchangeToken.address);
}

function standardToken() {
    return eth.contract(contracts.StandardToken.abi).at(contracts.StandardToken.address);
}

var contracts = {
    "ozcAccount": "0x2facaf9f7c2c8ef72a993d8dbcd02d8bbc3a9f43",
    "Certificate": {
        "address": "0x8cbf7dffa7838e6a6fb3a569f0c6a1891b555d48",
        "abi": [{
            "constant": false,
            "inputs": [{
                "name": "_IPFSAddress",
                "type": "string"
            }, {
                "name": "_reportID",
                "type": "string"
            }],
            "name": "registerAuditReport",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "addr",
                "type": "address"
            }],
            "name": "isContract",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "contractState",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "activateContract",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_newOwner",
                "type": "address"
            }],
            "name": "changeOwner",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "index",
                "type": "uint256"
            }],
            "name": "getCertificateDetailsByIndex",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }, {
                "name": "",
                "type": "string"
            }, {
                "name": "",
                "type": "string"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getNumberOfCertificates",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_IPFSAddress",
                "type": "string"
            }, {
                "name": "_certificateID",
                "type": "string"
            }],
            "name": "registerProofOfAsset",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "setContractAdminOnly",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "cType",
                "type": "uint8"
            }, {
                "indexed": false,
                "name": "IPFS",
                "type": "string"
            }, {
                "indexed": false,
                "name": "ID",
                "type": "string"
            }],
            "name": "CertificateAdded",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldOwner",
                "type": "address"
            }, {
                "indexed": false,
                "name": "newOwner",
                "type": "address"
            }],
            "name": "OwnerChanged",
            "type": "event"
        }]

    },
    "ExchangeToken": {
        "address": "0x314f6a6d6d8ea531beccc969b630570332223382",
        "abi": [{
            "constant": false,
            "inputs": [{
                "name": "_tokenData",
                "type": "address"
            }],
            "name": "resetTokenData",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_fee",
                "type": "uint16"
            }],
            "name": "setFeePercent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_spender",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "approve",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "addr",
                "type": "address"
            }],
            "name": "isContract",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{
                "name": "totalSupply",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_from",
                "type": "address"
            }, {
                "name": "_to",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transferFrom",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_owner",
                "type": "address"
            }],
            "name": "balanceOf",
            "outputs": [{
                "name": "balance",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "contractState",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "activateContract",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_newOwner",
                "type": "address"
            }],
            "name": "changeOwner",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_to",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transfer",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getFeePercent",
            "outputs": [{
                "name": "",
                "type": "uint16"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getOzAccount",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_owner",
                "type": "address"
            }, {
                "name": "_spender",
                "type": "address"
            }],
            "name": "allowance",
            "outputs": [{
                "name": "remaining",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "setContractAdminOnly",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "inputs": [],
            "payable": false,
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldRate",
                "type": "uint16"
            }, {
                "indexed": false,
                "name": "newRate",
                "type": "uint16"
            }],
            "name": "TransactionFeeChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldOwner",
                "type": "address"
            }, {
                "indexed": false,
                "name": "newOwner",
                "type": "address"
            }],
            "name": "OwnerChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_from",
                "type": "address"
            }, {
                "indexed": true,
                "name": "_to",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }],
            "name": "Transfer",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_owner",
                "type": "address"
            }, {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }],
            "name": "Approval",
            "type": "event"
        }]
    },

    "StandardToken": {
        "address": "0x04b9c3e807d59fb8d87c2e1b961cb14d0e52df7b",
        "abi": [{
            "constant": false,
            "inputs": [{
                "name": "_tokenData",
                "type": "address"
            }],
            "name": "resetTokenData",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_fee",
                "type": "uint16"
            }],
            "name": "setFeePercent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_amount",
                "type": "uint256"
            }, {
                "name": "_seller",
                "type": "address"
            }],
            "name": "buyCoins",
            "outputs": [],
            "payable": true,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_spender",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "approve",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "addr",
                "type": "address"
            }],
            "name": "isContract",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{
                "name": "totalSupply",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_from",
                "type": "address"
            }, {
                "name": "_to",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transferFrom",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "withdrawAllEther",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_userContract",
                "type": "address"
            }],
            "name": "resetUser",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "unFreezeAccount",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "requestArbitration",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_seller",
                "type": "address"
            }],
            "name": "getPrices",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }, {
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_owner",
                "type": "address"
            }],
            "name": "balanceOf",
            "outputs": [{
                "name": "balance",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "withdrawEther",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_percentage",
                "type": "uint8"
            }],
            "name": "setAffiliatePercent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "getAffiliateInfo",
            "outputs": [{
                "name": "",
                "type": "address"
            }, {
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "contractState",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "activateContract",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_newOwner",
                "type": "address"
            }],
            "name": "changeOwner",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_to",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transfer",
            "outputs": [{
                "name": "success",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getFeePercent",
            "outputs": [{
                "name": "",
                "type": "uint16"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getOzAccount",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_owner",
                "type": "address"
            }, {
                "name": "_spender",
                "type": "address"
            }],
            "name": "allowance",
            "outputs": [{
                "name": "remaining",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_isBuy",
                "type": "bool"
            }, {
                "name": "_price",
                "type": "uint256"
            }],
            "name": "setPrice",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "getAffiliateBalance",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "freezeAccount",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "setContractAdminOnly",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldRate",
                "type": "uint8"
            }, {
                "indexed": false,
                "name": "newRate",
                "type": "uint8"
            }],
            "name": "AffilliatePercentageChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_sender",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "OzCoinPaid",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_sender",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_affiliate",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "AffiliatePaid",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_offered",
                "type": "uint256"
            }, {
                "indexed": false,
                "name": "_required",
                "type": "uint256"
            }],
            "name": "InsufficientFunds",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "recipient",
                "type": "address"
            }, {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }],
            "name": "FailedToSend",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }],
            "name": "AccountFrozen",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }],
            "name": "AccountUnFrozen",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "ID",
                "type": "bytes32"
            }],
            "name": "ArbitrationRequested",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "seller",
                "type": "address"
            }, {
                "indexed": false,
                "name": "side",
                "type": "bool"
            }, {
                "indexed": false,
                "name": "price",
                "type": "uint256"
            }],
            "name": "PriceSet",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "EtherWithdrawn",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldRate",
                "type": "uint16"
            }, {
                "indexed": false,
                "name": "newRate",
                "type": "uint16"
            }],
            "name": "TransactionFeeChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldOwner",
                "type": "address"
            }, {
                "indexed": false,
                "name": "newOwner",
                "type": "address"
            }],
            "name": "OwnerChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_from",
                "type": "address"
            }, {
                "indexed": true,
                "name": "_to",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }],
            "name": "Transfer",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_owner",
                "type": "address"
            }, {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }],
            "name": "Approval",
            "type": "event"
        }]

    },
    "User": {
        "address": "0x2346095ac23cb5b9a2ae97658bde5543f57ed6ff",
        "abi": [{
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }, {
                "name": "_name",
                "type": "bytes32"
            }, {
                "name": "_details",
                "type": "string"
            }],
            "name": "createAdministrator",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }, {
                "name": "_name",
                "type": "bytes32"
            }, {
                "name": "newDetails",
                "type": "string"
            }, {
                "name": "_affiliateAccount",
                "type": "address"
            }, {
                "name": "_affiliateCompany",
                "type": "address"
            }],
            "name": "updateUserDetails",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "addr",
                "type": "address"
            }],
            "name": "isContract",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "getAffiliateCompany",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_affiliate",
                "type": "address"
            }],
            "name": "setAffiliate",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getTotalNumberOfUsers",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "findUserRole",
            "outputs": [{
                "name": "",
                "type": "bool"
            }, {
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "reActivateUser",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "contractState",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "activateContract",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_newOwner",
                "type": "address"
            }],
            "name": "changeOwner",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "getAffiliate",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_affiliateCompany",
                "type": "address"
            }],
            "name": "setAffiliateCompany",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }, {
                "name": "_affiliateAccount",
                "type": "address"
            }, {
                "name": "_affiliateCompany",
                "type": "address"
            }, {
                "name": "_name",
                "type": "bytes32"
            }, {
                "name": "_details",
                "type": "string"
            }],
            "name": "createCoinOwner",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "deActivateUser",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "getUserDetails",
            "outputs": [{
                "name": "",
                "type": "bytes32"
            }, {
                "name": "",
                "type": "uint8"
            }, {
                "name": "",
                "type": "string"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }, {
                "name": "_role",
                "type": "uint8"
            }],
            "name": "changeRole",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "checkRegistration",
            "outputs": [{
                "name": "",
                "type": "bool"
            }, {
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "setContractAdminOnly",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "inputs": [],
            "payable": false,
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_role",
                "type": "uint8"
            }],
            "name": "UserAdded",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_newRole",
                "type": "uint8"
            }],
            "name": "UserRoleChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }],
            "name": "UserDeactivated",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }],
            "name": "UserReactivated",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }],
            "name": "UserDetailsChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "affiliate",
                "type": "address"
            }],
            "name": "AffiiateSet",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "_account",
                "type": "address"
            }, {
                "indexed": false,
                "name": "affiliateCompany",
                "type": "address"
            }],
            "name": "AffiiateCompanySet",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldOwner",
                "type": "address"
            }, {
                "indexed": false,
                "name": "newOwner",
                "type": "address"
            }],
            "name": "OwnerChanged",
            "type": "event"
        }]

    },
    "TokenData": {
        "address": "0x4f97185e8002f93b5ca5ecba8277bb7661b9c750",
        "abi": [{
            "constant": false,
            "inputs": [{
                "name": "_fee",
                "type": "uint16"
            }],
            "name": "setFeePercent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "addr",
                "type": "address"
            }],
            "name": "isContract",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_ID",
                "type": "bytes32"
            }],
            "name": "approveArbitration",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "checkStatus",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }, {
                "name": "",
                "type": "address"
            }, {
                "name": "",
                "type": "address"
            }, {
                "name": "",
                "type": "address"
            }, {
                "name": "",
                "type": "address"
            }, {
                "name": "",
                "type": "uint16"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getOzCoinAccount",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_source",
                "type": "address"
            }, {
                "name": "_destination",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }, {
                "name": "_ID",
                "type": "bytes32"
            }],
            "name": "aribtrateTransfer",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "setFeeAccount",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_requester",
                "type": "address"
            }],
            "name": "requestArbitration",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_owner",
                "type": "address"
            }],
            "name": "balanceOf",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "setArbitrationAccount",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "",
                "type": "address"
            }],
            "name": "coins",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_exchangeController",
                "type": "address"
            }],
            "name": "setExchangeController",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "contractState",
            "outputs": [{
                "name": "",
                "type": "uint8"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "activateContract",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_sender",
                "type": "address"
            }, {
                "name": "_recipient",
                "type": "address"
            }, {
                "name": "_value",
                "type": "uint256"
            }, {
                "name": "_transferTime",
                "type": "uint64"
            }],
            "name": "transfer",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "calculateFee",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_newOwner",
                "type": "address"
            }],
            "name": "changeOwner",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "mintCoins",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_limit",
                "type": "uint16"
            }],
            "name": "setArbitrationLimit",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_walletController",
                "type": "address"
            }],
            "name": "setWalletController",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "fillFromParent",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{
                "name": "_account",
                "type": "address"
            }],
            "name": "setOzCoinAccount",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getFeePercent",
            "outputs": [{
                "name": "",
                "type": "uint16"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "getTotalSupply",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "setContractAdminOnly",
            "outputs": [],
            "payable": false,
            "type": "function"
        }, {
            "inputs": [{
                "name": "_totalSupply",
                "type": "uint256"
            }, {
                "name": "_ozCoinAccount",
                "type": "address"
            }, {
                "name": "_cloneParent",
                "type": "address"
            }],
            "payable": false,
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }],
            "name": "CoinsMinted",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "name",
                "type": "string"
            }, {
                "indexed": false,
                "name": "newAddress",
                "type": "address"
            }],
            "name": "AccountChanged",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "requester",
                "type": "address"
            }, {
                "indexed": false,
                "name": "ID",
                "type": "bytes32"
            }],
            "name": "ArbitrationRequested",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "approver",
                "type": "address"
            }, {
                "indexed": false,
                "name": "ID",
                "type": "bytes32"
            }],
            "name": "ArbitrationApproved",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "name": "source",
                "type": "address"
            }, {
                "indexed": false,
                "name": "destination",
                "type": "address"
            }, {
                "indexed": false,
                "name": "sender",
                "type": "address"
            }, {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }],
            "name": "ArbitrationTransfer",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "_seller",
                "type": "address"
            }, {
                "indexed": false,
                "name": "_buyer",
                "type": "address"
            }, {
                "indexed": false,
                "name": "requiredAmount",
                "type": "uint256"
            }],
            "name": "InsufficientOZCBalance",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": false,
                "name": "oldOwner",
                "type": "address"
            }, {
                "indexed": false,
                "name": "newOwner",
                "type": "address"
            }],
            "name": "OwnerChanged",
            "type": "event"
        }]

    }

};
