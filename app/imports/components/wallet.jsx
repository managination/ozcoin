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
import {signAndSubmit, isValidAddress} from "../../imports/ethereum/ethereum-services";
import GetPassword from "./forms/confirm-transaction";
import {currentProfile} from "../api/model/profiles";
import {Globals} from "../api/model/globals";

export default class Wallet extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            ozcTransferMode: true,
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
                response.registrationStarted = true;
                self.setState(response);
                Session.set("showWait", false);
            })
        } else {
            this.setState({profile: profile});
        }
    }

    txFee = 0.001;

    componentWillMount() {
        let self = this;

        this.txFee = new BigNumber(Globals.findOne({name: "transaction-fee"}).value.toString());
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

    };

    _transactionConfirmed(password) {
        let self = this;
        let wasRegistration = this.state.showUserRegistrationDialog;
        this.setState({getPasswordVisible: false, showUserRegistrationDialog: false});
        Session.set("showWait", true);
        signAndSubmit(password, this.state.rawTx, true, this.state.profile.address, this.state.recipient)
            .then(() => {
                if (wasRegistration) {
                    Meteor.call('sync-user-details', (err) => {
                        Session.set("showWait", false);
                    });
                } else {
                    Meteor.call('update-balance', () => {
                        Session.set("showWait", false);
                    });
                }
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
        Meteor.callPromise('transfer-eth', this.state.recipient, new BigNumber(this.state.ethAmount.toString()).round(5, 1).toNumber())
            .then((response) => {
                response.getPasswordVisible = true;
                response.transferETH = true;
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
        Meteor.callPromise('transfer-ozc', this.state.recipient, new BigNumber(this.state.ozcAmount.toString()).round(5, 1).toNumber())
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
        Meteor.callPromise('buy-ozc', this.state.sourceAccount, this.state.ozcPurchase.toString(), this.state.sellPrice.toString())
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
            value = new BigNumber(value.toString());
            change.ozcAmountReceived = value.minus(value.times(this.txFee)).round(5, 1).toNumber();
            value = value.toNumber();
        }
        if (event.target.id == 'ozcAmountReceived') {
            value = new BigNumber(value.toString());
            change.ozcAmount = value.dividedBy(1 - this.txFee.toNumber()).round(5, 1).toNumber();
            value = value.toNumber();
        }
        change[event.target.id] = value;
        this.setState(change);
    };

    _handleSourceSelect(value, index, event) {
        this.setState({sourceAccount: value, sellPrice: this.sourceAccounts[index].price});
    }

    _getOzcForm(profile, prices) {
        let purchaseCardText = [];
        if (this.state.ozcTransferMode) {
            if (profile.balance.comparedTo(0.003) == -1) {
                purchaseCardText.push(<p key="purchaseCardText2">You will not be able to transfer any OzGLD out of
                    your wallet. You need at least 0.003 ETH to pay for the transaction.</p>)
            }
            purchaseCardText.push(<p key="purchaseCardText1">The amount tranfered is different from the amount
                received because there is
                a {this.txFee.times(100).toFormat(2)}% fee on OzGLD transfers</p>);
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
                        label="amount in OzGLD to transfer"
                        type={"number"}
                        placeholder="0.00"
                        className="md-cell md-cell--12"
                        disabled={!profile.ozcBalance.toNumber()}
                        value={this.state.ozcAmount}
                        onChange={this._handleChange}
                    />
                    < TextField
                        id="ozcAmountReceived"
                        label="amount in OzGLD the recipient will get"
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
                            disabled={profile.balance.comparedTo(0.003) == -1 || !profile.isRegistered
                            || !(this.state.ozcAmount > 0)
                            || profile.ozcBalance.comparedTo(this.state.ozcAmount) == -1
                            || !isValidAddress(this.state.recipient)}>
                        check
                    </Button>
                    <Button secondary
                            flat label="Transfer All"
                            onClick={() => this._handleChange(profile.ozcBalance.toNumber(), {target: {id: "ozcAmount"}})}
                            disabled={profile.balance.comparedTo(0.003) == -1 || !profile.ozcBalance.toNumber()
                            || !isValidAddress(this.state.recipient)}>
                        check
                    </Button>
                </CardActions>,
                <CardText key="purchaseCardText">
                    {purchaseCardText}
                </CardText>
            ]
        } else {
            let maxOzc = profile.balance.minus(0.09).dividedBy(prices.ozc.ETH).round(5, 1);
            if (!profile.isRegistered)
                purchaseCardText.push(<p key="purchaseCardText3">You must register your account with the smart-contract
                    before you can purchase through the wallet</p>);

            if (profile.balance.comparedTo(0.02) == -1)
                purchaseCardText.push(<p key="purchaseCardText5">In order to register you need at least 0.02 ETH in your
                    account</p>);
            else
                purchaseCardText.push(<p key="purchaseCardText4">For the {profile.formattedEthBalance} ETH in your
                    account you can
                    purchase {maxOzc.round(2, 1).toFormat(2)} OzGLD</p>);

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
                        helpText="Select which account you want to buy your OzGLD from"
                    />
                    < TextField
                        id="ozcPurchase"
                        label="amount in OzGLD you wish to purchase"
                        type={"number"}
                        placeholder="0.00"
                        className="md-cell md-cell--12"
                        disabled={profile.balance.comparedTo(prices.ozc.ETH / 100) == -1}
                        value={this.state.ozcPurchase}
                        onChange={this._handleChange}
                        helpText={"the minimum purchase amount is 0.01 OzGLD"}
                    />
                </form>,
                <CardActions key="transferCardAction" expander>
                    <Button primary={this.state.ozcAmount > 0}
                            flat label="Buy OzGLD"
                            onClick={this._buyOzc}
                            disabled={!profile.balance.toNumber() || !profile.isRegistered
                            || this.state.ozcPurchase < 0.01
                            || maxOzc.comparedTo(this.state.ozcPurchase.toString()) == -1}>
                        check
                    </Button>
                    <Button secondary
                            flat label="Spend all ETH"
                            onClick={() => this.setState({ozcPurchase: maxOzc.toNumber()})}
                            disabled={profile.balance.comparedTo(0.1) == -1 }>
                        check
                    </Button>
                </CardActions>,
                <CardText key="transferCardText">
                    {purchaseCardText}
                </CardText>
            ]
        }
    }

    render() {
        if (!Meteor.user()) return null;

        if (Meteor.user() && this.props.params.register && !this.state.registrationStarted) {
            let profile = currentProfile();
            if (profile && !profile.isRegistered) {
                Session.set("showWait", true);
                this._setProfile(profile);
            }
        }

        const profile = currentProfile();
        const prices = {
            eth: Globals.findOne({name: "ethPrice"}) || {BTC: 0, USD: 0, EUR: 0},
            ozc: Globals.findOne({name: "ozcPrice"}) || {ETH: 0, USD: 0, BTC: 0},
        };

        profile.ozcBalanceUSD = new BigNumber(profile.ozcBalance.toString()).round(2, 1).times(prices.ozc.USD).toFormat(2);
        profile.ethBalanceUSD = new BigNumber(profile.balance.toString()).round(2, 1).times(prices.eth.USD).toFormat(2);
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
                                    title={profile.formattedOzcBalance + " OzGLD = " + profile.ozcBalanceUSD + " USD"}
                                    subtitle={"price for OzGLD in USD " + (new BigNumber(prices.ozc.USD.toString()).toFormat(2))}>
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
                                    subtitle={"price for ETH in USD " + (new BigNumber(prices.eth.USD.toString()).toFormat(2))}>
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
                                    disabled={profile.balance.comparedTo(0.00042) == -1 || !(this.state.ethAmount > 0)
                                    || this.state.ethAmount > profile.balance.minus(0.00042).toNumber()
                                    || !isValidAddress(this.state.recipient)}>
                                check
                            </Button>
                            <Button secondary
                                    flat label="Transfer All"
                                    onClick={() => this.setState({ethAmount: profile.balance.minus(0.00042).round(5, 1).toNumber()})}
                                    disabled={profile.balance.comparedTo(0.00042) == -1
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