import {Meteor} from "meteor/meteor";
import {Accounts} from "meteor/accounts-base";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import React, {PureComponent} from "react";
import Dialog from "react-md/lib/Dialogs";
import Button from "react-md/lib/Buttons/Button";
import TextField from "react-md/lib/TextFields";
import Toolbar from "react-md/lib/Toolbars";
import Paper from "react-md/lib/Papers";
import {browserHistory} from "react-router";
import {createKeystore} from "../../../imports/ethereum/ethereum-services";
import {Profiles, Roles, currentProfile} from "../../api/model/profiles";
import {Globals} from "../../api/model/globals";

export default class RegistrationDialog extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {visible: true, noAffiliate: true, affiliate: ''};
        this._openDialog = this._openDialog.bind(this);
        this._closeDialog = this._closeDialog.bind(this);
        this._createKeystore = this._createKeystore.bind(this);
    }

    componentWillReceiveProps() {
        console.log("componentWillReceiveProps registrationDialog.jsx");
        let self = this;
        let affiliateAddress = this.props.params.affiliate || "0xb4EcEDf81F61121468BD57dEA9a1037Ef15d56E9";
        Meteor.callPromise('get-affiliate', affiliateAddress)
            .then((result) => {
                if (!result) return Meteor.callPromise('get-affiliate', "0xb4EcEDf81F61121468BD57dEA9a1037Ef15d56E9");
                return result;
            })
            .then((result) => {
                if (!result)
                    self.setState({noAffiliate: true});
                else
                    self.setState({affiliate: result, noAffiliate: false});
            })
            .catch((err) => {
                self.setState({noAffiliate: true});
            });
    }

    _openDialog(e) {
        let {pageX, pageY} = e;
        if (e.changedTouches) {
            const [touch] = e.changedTouches;
            pageX = touch.pageX;
            pageY = touch.pageY;
        }

        this.setState({visible: true, pageX, pageY});
    }

    _closeDialog() {
        this.setState({visible: false});
    }

    _setProfile() {
        Meteor.call('sync-user-details', (err) => {
            if (err)
                console.log("ERROR", err);
            Meteor.subscribe("current-profile", () => {
                let profile = currentProfile();
                Session.set('showWait', false);
                let userNum = 1;
                if (profile)
                    userNum = profile.userNum;

                if (userNum > Globals.findOne({name: 'user-count'}).max) {
                    browserHistory.push('/delay-notification');
                }
            });
        });
    }

    _createKeystore() {
        let self = this;
        let alias = this.refs.alias.getField().value;
        let email = this.refs.email.getField().value;
        let mnemonic = this.refs.mnemonic.getField().value;

        let keystorePassword = this.refs.keystorePassword.getField().value;
        if (keystorePassword.length < 1) return;

        Session.set('showWait', true);
        createKeystore(alias, email, keystorePassword, null, mnemonic)
            .then((keystore) => {
                Session.set('keystore', keystore);
                let options = {
                    username: keystore.username,
                    email: keystore.username + '@ozcoin.eth',
                    password: keystore.password,
                };
                Accounts.createUser(options, (err) => {
                    if (err) {
                        browserHistory.push('/wallet');
                        console.log("user creation error ", err);
                        Meteor.loginWithPassword(options.username, options.password, (err) => {
                            if (err) {
                                console.log("ERROR could not login", err);
                                Session.set('showWait', false);
                            } else {
                                self._setProfile();
                            }
                        });
                    } else {
                        browserHistory.push('/info-page/yes');
                        Profiles.insert({
                            owner: Meteor.userId(),
                            email: email,
                            alias: alias,
                            role: Roles.coinowner,
                            address: '0x' + keystore.username,
                            affiliate: self.state.affiliate.address,
                            affiliateCompany: self.state.affiliate.affiliateCompany,
                            salt: keystore.salt,
                            mnemonicHash: keystore.mnemonicHash,
                            isRegistered: false,
                        }, (err) => {
                            self._setProfile();
                        });
                    }
                })
            })
            .catch((error) => {
                console.log("keystore creation error ", error);
            });
    }

    render() {
        // Session.set("show-wait", false);
        const nav = null;//<Button icon onClick={this._closeDialog}>close</Button>;
        const action = <Button raised label="Create keystore" onClick={this._createKeystore}/>;
        const dialogLabel = "Create new Keystore";
        const toolbarTitle = "Create new keystore affiliated to";
        const {user} = this.props;
        let dialogBody = null;
        if (this.state.noAffiliate) {
            dialogBody =
                <div className="md-toolbar-relative--prominent md-text-center">
                    <h1>you must choose an affiliate in order to create an account</h1>
                    <h2>get a link from an affiliate or go to <a
                        href="/register/0xb4EcEDf81F61121468BD57dEA9a1037Ef15d56E9">default registration</a></h2>
                </div>;
        } else {
            dialogBody = <form className="md-toolbar-relative md-grid" onSubmit={(e) => e.preventDefault()}>
                <TextField
                    id="ksEMail"
                    ref="email"
                    label="e-mail"
                    placeholder="e-mail"
                    customSize="title"
                    className="md-cell md-cell--12"
                    required
                    defaultValue=""
                    pattern="^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$"
                />
                <TextField
                    id="ksName"
                    ref="alias"
                    label="First and last names"
                    placeholder="First and last names"
                    defaultValue=""
                    customSize="title"
                    className="md-cell md-cell--12"
                    required
                />
                <TextField
                    id="keystorePassword"
                    ref="keystorePassword"
                    label="Keystore Password"
                    placeholder="Wallet Password"
                    type="password"
                    customSize="title"
                    className="md-cell md-cell--12"
                    required
                />
                <Paper
                    key={1}
                    zDepth={1}
                    raiseOnHover={true}
                    className="md-cell md-cell--12"
                >
                    <TextField
                        autoComplete="off"
                        id="mnemonic"
                        ref="mnemonic"
                        label="mnemonic"
                        placeholder="if you know your mnemonic paste it here"
                        customSize="title"
                        className="md-cell md-cell--12"
                        helpText="if you do not provide a mnemonic a random one will be created for you"
                    />
                    <h1 style={{"textAlign": "center"}}>
                        If you have lost your password or cannot access your wallet, re-enter your existing information
                        in the relevant fields and enter your existing wallet's mnemonic here to regenerate your
                        original OzGLD wallet.
                    </h1>
                </Paper>
            </form>

        }
        //TODO add validation to the form in order to avoid invalid patterns
        return (
            <Dialog
                id="keystoreCreation"
                visible={this.state.visible}
                pageX={1}
                pageY={1}
                onHide={this._closeDialog}
                fullPage
                aria-label={dialogLabel}
            >
                <Toolbar
                    colored
                    nav={nav}
                    actions={action}
                    title={toolbarTitle + ' ' + (this.state.affiliate.alias || '')}
                    fixed
                />
                {dialogBody}
            </Dialog>
        );
    }
}

