export const nameRegistry = {
    address: "0xfe5726060f090e1b487add3144faae276e4653aa",
    abi: [{
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_name", "type": "string"}, {"name": "_address", "type": "address"}, {
            "name": "_abi",
            "type": "string"
        }],
        "name": "addMapping",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_admin", "type": "address"}],
        "name": "setAdmin",
        "outputs": [],
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
        "constant": true,
        "inputs": [{"name": "_name", "type": "string"}],
        "name": "getContractDetails",
        "outputs": [{"name": "", "type": "address"}, {"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "setContractAdminOnly",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {"inputs": [], "payable": false, "type": "constructor"}],
};