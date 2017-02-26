import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import BigNumber from "bignumber.js";
import Button from "react-md/lib/Buttons";
import Card from "react-md/lib/Cards";
import CardTitle from "react-md/lib/Cards/CardTitle";
import CardActions from "react-md/lib/Cards/CardActions";
import CardText from "react-md/lib/Cards/CardText";
import Media, {MediaOverlay} from "react-md/lib/Media";
import TextField from "react-md/lib/TextFields";
import {add0x, signAndSubmit, isValidAddress} from "../api/ethereum-services";
import GetPassword from "./forms/confirm-transaction";
import {Profiles} from "../api/model/profiles";
import {Globals} from "../api/model/globals";

export default class Wallet extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            txData: "",
            getPasswordVisible: false,
            showUserRegistrationDialog: false,
            transactionCost: 0,
            accountBalance: 0,
            profile: {balance: new BigNumber(0)},
            ethAmount: '',
            ozcAmount: '',
            recipient: '',
        };

        this._submitTx.bind(this);
        this._transferEth.bind(this);
        this._transferOzc.bind(this);
        this._handleChange.bind(this);
    }

    componentWillMount() {
        Meteor.subscribe('globals', (err) => {
        });

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
            .then(() => {
                Session.set("showWait", false);
            })
            .catch((err) => {
                console.log("submitting signed transaction", err);
                Session.set("showWait", false)
            });
    };

    _transactionCanceled = () => {
        Session.set("showWait", false);
        this.setState({getPasswordVisible: false});
    };

    _submitTx = () => {
    };

    _transferEth = () => {
        const self = this;
        Session.set("showWait", true);
        Meteor.callPromise('transfer-eth', this.state.recipient, this.state.ethAmount)
            .then((response) => {
                response.getPasswordVisible = true;
                Session.set("showWait", false);
                self.setState(response);
            })
            .catch((err) => {
                console.log(err);
                Session.set("showWait", false);
            })
    };

    _transferOzc = () => {
        const self = this;
        Session.set("showWait", true);
        Meteor.callPromise('transfer-ozc', this.state.recipient, this.state.ozcAmount)
            .then((response) => {
                response.getPasswordVisible = true;
                Session.set("showWait", false);
                self.setState(response);
            })
            .catch((err) => {
                console.log(err);
                Session.set("showWait", false);
            })
    };

    _handleChange = (value, event) => {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };


    componentDidUpdate(prevProps, prevState) {
    }

    render() {
        const profile = Profiles.findOne({address: add0x(Meteor.user().username)})
            || {balance: new BigNumber(0), ozcBalance: new BigNumber(0)};
        const prices = {
            eth: Globals.findOne({name: "ethPrice"}) || {BTC: 0, USD: 0, EUR: 0},
            ozc: Globals.findOne({name: "ozcPrice"}) || {ETH: 0, USD: 0, BTC: 0},
        };

        const ozcBalanceUSD = new BigNumber(profile.ozcBalance).times(prices.ozc.USD).toFormat(2);
        const ethBalanceUSD = new BigNumber(profile.balance).times(prices.eth.USD).toFormat(2);
        let dialogTitle;
        if (this.state.getPasswordVisible)
            dialogTitle = "Enter our password to validate the transaction";
        else
            dialogTitle = "Please confirm this transaction in order to register your account";

        return (
            <div style={{width: "100%"}}>
                <GetPassword visible={this.state.showUserRegistrationDialog || this.state.getPasswordVisible}
                             cost={this.state.transactionCost}
                             balance={profile.balance.toNumber()}
                             confirm={this._transactionConfirmed}
                             cancel={this._transactionCanceled}
                             title={dialogTitle}
                />
                <div className="md-grid md-toolbar-relative">
                    <Card style={{maxWidth: 400}} className="md-cell md-cell--6">
                        <Media>
                            <img src="/images/gold-ounces.jpg" role="presentation"/>
                            <MediaOverlay>
                                <CardTitle title={profile.formattedOzcBalance + " OZC = " + ozcBalanceUSD + " USD"}
                                           subtitle={"price for OZC in USD " + (new BigNumber(prices.ozc.USD).toFormat(2))}>
                                    <Button className="md-cell--right" icon>
                                        shopping_cart
                                    </Button>
                                </CardTitle>
                            </MediaOverlay>
                        </Media>
                        <form onSubmit={(e) => e.preventDefault()} className="md-grid">
                            < TextField
                                id="recipient"
                                label="Recipient address"
                                placeholder="0x77454e832261aeed81422348efee52d5bd3a3684"
                                className="md-cell md-cell--12"
                                disabled={!profile.ozcBalance.toNumber()}
                                value={this.state.recipient}
                                onChange={this._handleChange}
                            />
                            < TextField
                                id="ozcAmount"
                                label="amount in OZC"
                                placeholder="0.00"
                                className="md-cell md-cell--12"
                                disabled={!profile.ozcBalance.toNumber()}
                                value={this.state.ozcAmount}
                                onChange={this._handleChange}
                            />
                        </form>
                        <CardActions expander>
                            <Button primary={this.state.ozcAmount > 0}
                                    flat label="Transfer"
                                    onClick={this._transferOzc}
                                    disabled={!profile.balance.toNumber() || !(this.state.ozcAmount > 0)
                                    || this.state.ozcAmount > profile.ozcBalance.toNumber()
                                    || !isValidAddress(this.state.recipient)}>
                                check
                            </Button>
                        </CardActions>
                        <CardText>
                            Lorem Ipsum
                        </CardText>
                    </Card>
                    <Card style={{maxWidth: 400}} className="md-cell md-cell--6">
                        <Media>
                            <img src="/images/ethereum-logo.jpg" role="presentation"/>
                            <MediaOverlay>
                                <CardTitle title={profile.formattedEthBalance + " ETH = " + ethBalanceUSD + " USD"}
                                           subtitle={"price for ETH in USD " + (new BigNumber(prices.eth.USD).toFormat(2))}>
                                    <Button className="md-cell--right"
                                            style={profile.transferFees ? {color: "#8BC34A"} : {}}
                                            disabled={!profile.transferFees}
                                            onClick={() => alert("I was clicked")}
                                            icon>
                                        monetization_on
                                    </Button>
                                </CardTitle>
                            </MediaOverlay>
                        </Media>
                        <form onSubmit={(e) => e.preventDefault()} className="md-grid">
                            < TextField
                                id="recipient"
                                label="Recipient address"
                                placeholder="0x77454e832261aeed81422348efee52d5bd3a3684"
                                className="md-cell md-cell--12"
                                disabled={!profile.balance.toNumber()}
                                value={this.state.recipient}
                                onChange={this._handleChange}
                            />
                            < TextField
                                id="ethAmount"
                                label="amount in ETH"
                                placeholder="0.00"
                                className="md-cell md-cell--12"
                                disabled={!profile.balance.toNumber()}
                                value={this.state.ethAmount}
                                onChange={this._handleChange}
                            />
                        </form>
                        <CardActions expander>
                            <Button primary={this.state.ethAmount > 0}
                                    flat label="Transfer"
                                    onClick={this._transferEth}
                                    disabled={!profile.balance.toNumber() || !(this.state.ethAmount > 0)
                                    || this.state.ethAmount > profile.balance.toNumber()
                                    || !isValidAddress(this.state.recipient)}>
                                check
                            </Button>
                        </CardActions>
                        <CardText>
                            {profile.transferFees ? "click on the green dollar sign ($) to redeem your transfer fees" : ""}
                        </CardText>
                    </Card>
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