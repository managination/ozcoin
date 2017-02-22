import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import BigNumber from "bignumber.js";
import Button from "react-md/lib/Buttons";
import {add0x, signAndSubmit} from "../api/ethereum-services";
import GetPassword from "./forms/confirm-transaction";
import {Profiles} from "../api/model/profiles";

export default class Wallet extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            txData: "",
            getPasswordVisible: false,
            showUserRegistrationDialog: false,
            transactionCost: 0,
            accountBalance: 0,
            profile: {balance: new BigNumber(0)}
        };

        this._submitTx.bind(this);
    }

    componentWillMount() {
        Meteor.subscribe('current-profile', (err) => {
            let profile = Profiles.findOne({address: add0x(Meteor.user().username)});
            if (profile && !profile.isRegistered && profile.balance && profile.balance.comparedTo(0) === 1) {
                Meteor.callPromise('register-user').then((response) => {
                    response.showUserRegistrationDialog = true;
                    response.profile = profile;
                    this.setState(response);
                })
            } else {
                this.setState({profile: profile});
            }
        });
    };

    _transactionConfirmed = (password) => {
        this.setState({getPasswordVisible: false});
        Session.set("showWait", true);
        signAndSubmit(password, this.state.rawTx, true)
            .then(() => Session.set("showWait", false))
            .catch(() => Session.set("showWait", false));
    };

    _transactionCanceled = () => {
        Session.set("showWait", false);
        this.setState({getPasswordVisible: false});
    };

    _submitTx = () => {
    };

    componentDidUpdate(prevProps, prevState) {
    }

    render() {
        const {profile} = this.state;
        return (
            <div>
                <GetPassword visible={this.state.showUserRegistrationDialog}
                             cost={this.state.transactionCost}
                             balance={profile.balance.toNumber()}
                             confirm={this._transactionConfirmed}
                             cancel={this._transactionCanceled}
                             title="Please confirm this transaction in order to register your account"
                />
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