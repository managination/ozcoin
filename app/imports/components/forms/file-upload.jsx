import React, {PureComponent} from 'react';
import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import {signing} from 'eth-lightwallet';
import {wallet} from '../../api/ethereum-services';
import {add0x} from '../../api/ethereum-services';

export default class FileUpload extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            file: null,
            fileName: '',
            documentId: '',
        };

        this._interval = null;

        this._selectFile.bind(this);
        this._handleChange.bind(this);
        this._uploadFile.bind(this);
    }

    _selectFile = (file) => {
        if (!file) {
            return;
        }
        this.setState({file, fileName: file.name, documentId: file.name});
    };

    _handleChange = (value, event) => {
        if (event.target.id === 'email') {
            this._handleSearch(value);
        }
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };

    _uploadFile = () => {
        let fileName = this.state.fileName;
        let documentId = this.state.documentId;
        let reader = new FileReader();
        let docType = this.props.params.docType;
        reader.onload = function (fileLoadEvent) {
            Meteor.call('file-upload', docType, fileName, documentId, reader.result, (err, rawTx) => {
                if (err) {
                    console.log(err);
                } else {
                    /*
                     let privateKey = wallet.keystore.exportPrivateKey('0x' + Meteor.user().username, wallet.pwDerivedKey);
                     let tx = new Tx(rawTx);
                     tx.sign(Buffer.from(privateKey, 'hex'));

                     let signedTxString = tx.serialize();
                     */
                    let signedTxString = signing.signTx(wallet.keystore, wallet.pwDerivedKey, add0x(rawTx), add0x(Meteor.user().username));
                    Meteor.call('submit-raw-tx', add0x(signedTxString.toString('hex')), (err, result) => {
                        console.log(err, result);
                    });
                }
            });
        };
        reader.readAsBinaryString(this.state.file);
    };

    render() {
        return (
            <div>
                <h2>{this.props.params.docType}</h2>

                <form className="md-grid">
                    < TextField
                        id="fileName"
                        ref="fileName"
                        label="File Name"
                        placeholder="File Name"
                        className="md-cell md-cell--6"
                        disabled={!this.state.file}
                        value={this.state.fileName}
                        onChange={this._handleChange}
                    />
                    < TextField
                        id="documentId"
                        ref="documentId"
                        label="Document ID"
                        placeholder="Document ID"
                        className="md-cell md-cell--6"
                        disabled={!this.state.file}
                        value={this.state.documentId}
                        onChange={this._handleChange}
                    />
                    <div className="file-block md-cell md-cell--12">
                        <FileInput
                            id="report"
                            secondary
                            label="Select"
                            accept="application/pdf"
                            onChange={this._selectFile}
                        />
                        <Button style={{marginLeft: 20}}
                                id="upload"
                                secondary raised
                                label="Upload"
                                disabled={!this.state.file}
                                onClick={this._uploadFile}
                        >cloud_upload</Button>
                    </div>
                </form>
            </div>
        )
    }
}