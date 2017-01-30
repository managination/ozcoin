import React, {PureComponent} from 'react';
import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base'
import {createContainer} from 'meteor/react-meteor-data';
import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons/Button';
import TextField from 'react-md/lib/TextFields';
import Toolbar from 'react-md/lib/Toolbars';
import Wait from './Wait';

import {createKeystore} from '../api/ethereum-services'

class RegistrationDialog extends PureComponent {
    constructor (props) {
        super (props);

        this.state = { visible: true, pageX: 1, pageY: 1 };
        this._openDialog = this._openDialog.bind (this);
        this._closeDialog = this._closeDialog.bind (this);
        this._createKeystore = this._createKeystore.bind (this);
    }

    _openDialog (e) {
        let { pageX, pageY } = e;
        if (e.changedTouches) {
            const [touch] = e.changedTouches;
            pageX = touch.pageX;
            pageY = touch.pageY;
        }

        this.setState ({ visible: true, pageX, pageY });
    }

    _closeDialog () {
        this.setState ({ visible: false });
    }

    _createKeystore () {
        let alias = this.refs.alias.getField().value;
        let email = this.refs.email.getField().value;
        let keystorePassword = this.refs.keystorePassword.getField().value;
        createKeystore(alias, email, keystorePassword)
            .then((keystore)=>{
                let options = {
                    username: keystore.username,
                    email: email,
                    password: keystore.password,
                    profile: {
                        fullName: alias
                    }
                }
                Accounts.createUser(options, (err) => {
                    console.log("user creation error ", err);
                })
            })
            .catch((error) => {

            });
    }

    render () {
        Session.set("show-wait", false);
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
                        title={toolbarTitle}
                        fixed
                    />
                    <form className="md-toolbar-relative md-grid" ref="keystoreCreation">
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
                    </form>
                </Dialog>
                <Wait/>
            </div>
        );
    }
}

export default createContainer (() => {
    return {
        user: Meteor.user (),
    };
}, RegistrationDialog);
