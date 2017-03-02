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
import {createKeystore, add0x} from "../api/ethereum-services";
import {Profiles, Roles} from "../api/model/profiles.js";

export default class RegistrationDialog extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {visible: true, pageX: 1, pageY: 1};
        this._openDialog = this._openDialog.bind(this);
        this._closeDialog = this._closeDialog.bind(this);
        this._createKeystore = this._createKeystore.bind(this);
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
                let profile = Profiles.findOne({address: add0x(Meteor.user().username)});
                Session.set('currentProfile', profile || {alias: "not logged in"});
                Session.set('showWait', false);
            });
        });
    }

    _createKeystore() {
        let self = this;
        let alias = this.refs.alias.getField().value;
        let email = this.refs.email.getField().value;
        let mnemonic = this.refs.mnemonic.getField().value;

        let keystorePassword = this.refs.keystorePassword.getField().value;
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
                    let initialLocation = Session.get('initialLocation');
                    if (!initialLocation || initialLocation.length < 5)
                        initialLocation = '/wallet';
                    browserHistory.push(initialLocation);
                    if (err) {
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
                        Profiles.insert({
                            owner: Meteor.userId(),
                            email: email,
                            alias: alias,
                            role: Roles.coinowner,
                            address: '0x' + keystore.username,
                            affiliate: self.props.params.affiliate,
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
        const nav = <Button icon onClick={this._closeDialog}>close</Button>;
        const action = <Button raised label="Create keystore" onClick={this._createKeystore}/>;
        const dialogLabel = "Create new Keystore";
        const toolbarTitle = "Create new keystore";
        const {user} = this.props;
        //TODO add validation to the form in order to avoid invalid patterns
        return (
            <div>
                <Dialog
                    id="keystoreCreation"
                    {...this.state}
                    onHide={this._closeDialog}
                    fullPage
                    aria-label={dialogLabel}
                >
                    <Toolbar
                        colored
                        nav={nav}
                        actions={action}
                        title={toolbarTitle + ' ' + (this.props.params.affiliate || '')}
                        fixed
                    />
                    <form className="md-toolbar-relative md-grid" onSubmit={(e) => e.preventDefault()}>
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
                            placeholder="Keystore Password"
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
                            <h1 style={{"textAlign": "center"}}>if you have an existing mnemonic paste it below</h1>
                            <TextField
                                id="mnemonic"
                                ref="mnemonic"
                                label="mnemonic"
                                placeholder="if you know your mnemonic paste it here"
                                customSize="title"
                                className="md-cell md-cell--12"
                                helpText="if you do not provide a mnemonic a random one will be created for you"
                            />
                            <h1 style={{"textAlign": "center"}}>
                                a random mnemonic will be generated if left empty
                            </h1>
                        </Paper>
                    </form>
                </Dialog>
            </div>
        );
    }
}

