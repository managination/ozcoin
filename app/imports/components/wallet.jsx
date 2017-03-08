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
import SelectField from "react-md/lib/SelectFields";
import {add0x, signAndSubmit, isValidAddress} from "../api/ethereum-services";
import GetPassword from "./forms/confirm-transaction";
import {Profiles} from "../api/model/profiles";
import {Globals} from "../api/model/globals";

export default class Wallet extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            ozcTransferMode: false,
            txData: "",
            getPasswordVisible: false,
            showUserRegistrationDialog: false,
            transactionCost: 0,
            accountBalance: 0,
            profile: {balance: new BigNumber(0)},
            ethAmount: '',
            ozcAmount: '',
            ozcPurchase: '',
            ozcAmountReceived: '',
            recipient: '',
            sourceAccount: '',
            sourceAccounts: [{name: '', address: ''}]
        };

        this._toggleMode = this._toggleMode.bind(this);
        this._transferEth = this._transferEth.bind(this);
        this._transferOzc = this._transferOzc.bind(this);
        this._buyOzc = this._buyOzc.bind(this);
        this._redeemAffiliateBalance = this._redeemAffiliateBalance.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this._handleSourceSelect = this._handleSourceSelect.bind(this);
        this._transactionConfirmed = this._transactionConfirmed.bind(this);
        this._transactionCanceled = this._transactionCanceled.bind(this);
        this._setProfile = this._setProfile.bind(this);
        this._getOzcForm = this._getOzcForm.bind(this);
    }

    _setProfile(profile) {
        let self = this;
        /*only create the coinowner if it does not exist yet and the ETH balance is positive*/
        if (profile && !profile.isRegistered && profile.balance && profile.balance.comparedTo(0) === 1) {
            Meteor.callPromise('register-user').then((response) => {
                response.showUserRegistrationDialog = true;
                response.profile = profile;
                self.setState(response);
            })
        } else {
            this.setState({profile: profile});
        }
    }

    txFee = 0.001;

    componentWillMount() {
        let self = this;

        this.txFee = new BigNumber(Globals.findOne({name: "transaction-fee"}).value);
        Meteor.callPromise('get-ozc-affiliate-price').then((affiliateCompany) => {
            let sourceAccounts = [
                {
                    name: "OZ Coin Account",
                    address: Globals.findOne({name: 'ozcoin-account'}).address,
                    price: Globals.findOne({name: "ozcPrice"}).ETH
                },
            ];
            if (affiliateCompany && affiliateCompany.price && affiliateCompany.price.sell > 0)
                sourceAccounts.push({
                    name: affiliateCompany.alias,
                    address: affiliateCompany.address,
                    price: affiliateCompany.price.sell
                });
            self.setState(
                {
                    sourceAccounts: sourceAccounts,
                    sourceAccount: sourceAccounts[0].address,
                    sellPrice: sourceAccounts[0].price
                });
        });

        if (Meteor.user() && this.props.params.register) {
            let profile = Profiles.findOne({owner: Meteor.userId()});
            if (profile) {
                self._setProfile(profile);
            }
        }
    };

    _transactionConfirmed(password) {
        this.setState({getPasswordVisible: false, showUserRegistrationDialog: false});
        Session.set("showWait", true);
        signAndSubmit(password, this.state.rawTx, true, this.state.profile.address, this.state.recipient)
            .then(() => {
                Session.set("showWait", false);
            })
            .catch((err) => {
                console.log("ERROR submitting signed transaction", err);
                Session.set("showWait", false)
            });
    };

    _transactionCanceled() {
        Session.set("showWait", false);
        this.setState({getPasswordVisible: false, showUserRegistrationDialog: false});
    };

    _toggleMode() {
        this.setState({ozcTransferMode: !this.state.ozcTransferMode})
    };

    _transferEth() {
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

    _transferOzc() {
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

    _buyOzc() {
        const self = this;
        Session.set("showWait", true);
        Meteor.callPromise('buy-ozc', this.state.sourceAccount, this.state.ozcPurchase, this.state.sellPrice)
            .then((response) => {
                response.getPasswordVisible = true;
                Session.set("showWait", false);
                self.setState(response);
            })
            .catch((err) => {
                console.log(err);
                Session.set("showWait", false);
            })
    }

    _redeemAffiliateBalance() {
        const self = this;
        Session.set("showWait", true);
        Meteor.callPromise('redeem-affiliate-share')
            .then((response) => {
                response.getPasswordVisible = true;
                Session.set("showWait", false);
                self.setState(response);
            })
            .catch((err) => {
                console.log(err);
                Meteor.call('update-balance', function () {
                    Session.set("showWait", false);
                });
            })
    };

    _handleChange(value, event) {
        let change = {};
        if (event.target.id == 'ozcAmount') {
            value = new BigNumber(value);
            change.ozcAmountReceived = value.minus(value.times(this.txFee)).round(5).toNumber();
            value = value.toNumber();
        }
        if (event.target.id == 'ozcAmountReceived') {
            value = new BigNumber(value);
            change.ozcAmount = value.dividedBy(1 - this.txFee.toNumber()).round(5).toNumber();
            value = value.toNumber();
        }
        change[event.target.id] = value;
        this.setState(change);
    };

    _handleSourceSelect(value, index, event) {
        this.setState({sourceAccount: value, sellPrice: this.sourceAccounts[index].price});
    }

    _getOzcForm(profile, prices) {
        if (this.state.ozcTransferMode) {
            return [
                <form key="transferForm" onSubmit={(e) => e.preventDefault()} className="md-grid">
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
                        label="amount in OZC to transfer"
                        type={"number"}
                        placeholder="0.00"
                        className="md-cell md-cell--12"
                        disabled={!profile.ozcBalance.toNumber()}
                        value={this.state.ozcAmount}
                        onChange={this._handleChange}
                    />
                    < TextField
                        id="ozcAmountReceived"
                        label="amount in OZC the recipient will get"
                        type={"number"}
                        placeholder="0.00"
                        className="md-cell md-cell--12"
                        disabled={!profile.ozcBalance.toNumber()}
                        value={this.state.ozcAmountReceived}
                        onChange={this._handleChange}
                    />
                </form>,
                <CardActions key="transferCardAction" expander>
                    <Button primary={this.state.ozcAmount > 0}
                            flat label="Transfer"
                            onClick={this._transferOzc}
                            disabled={!profile.balance.toNumber() || !(this.state.ozcAmount > 0)
                            || this.state.ozcAmount > profile.ozcBalance.toNumber()
                            || !isValidAddress(this.state.recipient)}>
                        check
                    </Button>
                </CardActions>,
                <CardText key="transferCardText">
                    <p>The amount tranfered is different from the amount received because there is
                        a {this.txFee.times(100).toFormat(2)}% fee on OZC transfers</p>
                </CardText>
            ]
        } else {
            let maxOzc = profile.balance.dividedBy(prices.ozc.ETH);
            return [
                <form key="transferForm" onSubmit={(e) => e.preventDefault()} className="md-grid">
                    <SelectField
                        id="sourceAccount"
                        label="Select the account to buy from"
                        value={this.state.sourceAccount}
                        menuItems={this.state.sourceAccounts}
                        itemLabel="name"
                        itemValue="address"
                        className="md-cell md-cell--12"
                        onChange={this._handleSourceSelect}
                        helpText="Select which account you want to buy your OZC from"
                    />,
                    < TextField
                        id="ozcPurchase"
                        label="amount in OZC you wish to purchase"
                        type={"number"}
                        placeholder="0.00"
                        className="md-cell md-cell--12"
                        disabled={profile.balance.comparedTo(prices.ozc.ETH / 100) == -1}
                        value={this.state.ozcPurchase}
                        onChange={this._handleChange}
                        helpText={"the minimum purchase amount is 0.01 OZC"}
                    />
                </form>,
                <CardActions key="transferCardAction" expander>
                    <Button primary={this.state.ozcAmount > 0}
                            flat label="Buy OZC"
                            onClick={this._buyOzc}
                            disabled={!profile.balance.toNumber() || this.state.ozcPurchase < 0.01
                            || maxOzc.comparedTo(this.state.ozcPurchase) == -1}>
                        check
                    </Button>
                </CardActions>,
                <CardText key="transferCardText">
                    <p>For the {profile.formattedEthBalance} ETH in your account you can
                        purchase {maxOzc.round(2).toFormat(2)} OZC</p>
                </CardText>
            ]
        }
    }

    render() {
        if (!Meteor.user()) return null;

        const profile = Profiles.findOne({address: add0x(Meteor.user().username)})
            || {balance: new BigNumber(0), ozcBalance: new BigNumber(0)};
        const prices = {
            eth: Globals.findOne({name: "ethPrice"}) || {BTC: 0, USD: 0, EUR: 0},
            ozc: Globals.findOne({name: "ozcPrice"}) || {ETH: 0, USD: 0, BTC: 0},
        };

        profile.ozcBalanceUSD = new BigNumber(profile.ozcBalance).times(prices.ozc.USD).round(2).toFormat(2);
        profile.ethBalanceUSD = new BigNumber(profile.balance).times(prices.eth.USD).round(2).toFormat(2);
        let dialogTitle;
        if (this.state.getPasswordVisible)
            dialogTitle = "Enter our password to validate the transaction";
        else
            dialogTitle = "Please confirm this transaction in order to register your account";

        if (this.state.ozcTransferMode) {
            this.modeButton = 'shopping_cart';
            this.ozcCardImage = '/images/gold-ounces.jpg';
        } else {
            this.modeButton = 'send';
            this.ozcCardImage = '/images/buy-gold.jpg';
        }
        let ozcForm = this._getOzcForm(profile, prices);

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
                            <img src={this.ozcCardImage} role="presentation"/>
                            <MediaOverlay>
                                <CardTitle
                                    title={profile.formattedOzcBalance + " OZC = " + profile.ozcBalanceUSD + " USD"}
                                    subtitle={"price for OZC in USD " + (new BigNumber(prices.ozc.USD).toFormat(2))}>
                                    <Button className="md-cell--right" icon onClick={this._toggleMode}>
                                        {this.modeButton}
                                    </Button>
                                </CardTitle>
                            </MediaOverlay>
                        </Media>
                        {ozcForm}
                    </Card>
                    <Card style={{maxWidth: 400}} className="md-cell md-cell--6">
                        <Media>
                            <img src="/images/ethereum-logo.jpg" role="presentation"/>
                            <MediaOverlay>
                                <CardTitle
                                    title={profile.formattedEthBalance + " ETH = " + profile.ethBalanceUSD + " USD"}
                                    subtitle={"price for ETH in USD " + (new BigNumber(prices.eth.USD).toFormat(2))}>
                                    <Button className="md-cell--right"
                                            style={profile.affiliateBalance ? {color: "#8BC34A"} : {}}
                                            disabled={!profile.affiliateBalance}
                                            onClick={this._redeemAffiliateBalance}
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
                                type={"number"}
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
                            {profile.affiliateBalance ? "click on the green dollar sign ($) to redeem your affiliate share" : ""}
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