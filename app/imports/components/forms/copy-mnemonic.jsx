import CryptoJS from "crypto-js";
import * as LocalStorage from "meteor/simply:reactive-local-storage";
import React, {PropTypes, PureComponent} from "react";
import {createContainer} from "meteor/react-meteor-data";
import Dialog from "react-md/lib/Dialogs";
import Toolbar from "react-md/lib/Toolbars";
import TextField from "react-md/lib/TextFields";
import Button from "react-md/lib/Buttons";
import CopyToClipboard from "react-copy-to-clipboard";

export default class CopyMnemonicOverlay extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {pageX: 1, pageY: 1, ksPassword: '', mnemonic: ''};

        this._decryptMnemonic = this._decryptMnemonic.bind(this);
        this._closeDialog = this._closeDialog.bind(this);
        this._hideOverlay = this._hideOverlay.bind(this);
    }

    componentWillMount() {
        this._showToast = this.props.showToast;
    }

    _closeDialog() {
        Session.set("showCopyMnemonic", false);
    }

    _decryptMnemonic(value, event) {
        try {
            let mnemonic = CryptoJS.AES.decrypt(LocalStorage.getItem('encrypted-mnemonic'), value).toString(CryptoJS.enc.Utf8);
            this.setState({mnemonic: mnemonic});
        } catch (err) {
            console.log(err);
        }
        this.setState({ksPassword: value});
    };

    _hideOverlay() {
        Session.set("showCopyMnemonic", false);
        this.setState({ksPassword: "", mnemonic: ""});
        this._showToast("mnemonic copied");
    }

    render() {
        const {visible, cost, balance} = this.props;
        return (
            <Dialog
                id="CopyMnemonicOverlay"
                visible={visible}
                fullPage
                aria-label="dialogLabel"
                focusOnMount={false}
            >
                <Toolbar
                    colored
                    title={"You should copy your mnemonic for safe keeping"}
                    actions={<Button icon onClick={this._closeDialog}>close</Button>}
                    fixed
                />
                <form className="md-toolbar-relative md-grid" onSubmit={(e) => e.preventDefault()}>
                    <div className="md-cell--12">
                        <h2>Your mnemonic allows you to restore your key store and your account</h2>
                        <h1>this is the key to all your wealth: KEEP YOUR MNEMONIC SAFE</h1>
                    </div>
                    <TextField
                        id="ksPassword"
                        label="Password"
                        placeholder="Enter Password to decrypt your mnemonic"
                        customSize="title"
                        className="md-cell md-cell--12"
                        value={this.state.ksPassword}
                        onChange={this._decryptMnemonic}
                        type="password"
                    />
                    <CopyToClipboard text={this.state.mnemonic}
                                     onCopy={this._hideOverlay}>
                        <Button flat iconBefore={false}
                                label={this.state.mnemonic}
                                disabled={this.state.mnemonic.length < 2}
                                tooltipLabel="click here to copy your 12 secret words">
                            content_copy
                        </Button>
                    </CopyToClipboard>

                </form>
            </Dialog>
        );
    }
}

CopyMnemonicOverlay.propTypes = {
    showToast: PropTypes.func,
};
