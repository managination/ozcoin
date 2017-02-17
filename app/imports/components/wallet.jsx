import React, {PureComponent} from 'react';
import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import {wallet} from '../api/ethereum-services';
import {getWeb3} from '../api/ethereum-services';
import {signing} from 'eth-lightwallet';
import {getCertificateContract} from '../api/contracts/ethereum-contracts';

export default class Wallet extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            txData: "",
        };

        this._submitTx.bind(this);
    }

    _submitTx = () => {
        let privateKey = wallet.keystore.exportPrivateKey('0x' + Meteor.user().username, wallet.pwDerivedKey);
        Meteor.call('submit-predefined-tx', privateKey);
    };

    render() {
        return (
            <div>
                <h2>Wallet</h2>
                {this.state.txData}
                <div>
                    <Button raised label="Submit TX" onClick={this._submitTx}/>
                </div>
                <div>
                    <div>
                        {this.state.txHash}
                    </div>
                    <div>
                        {this.state.txError}
                    </div>
                </div>
            </div>
        )
    }
}