import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import BigNumber from "bignumber.js";
import Button from "react-md/lib/Buttons";
import Card from "react-md/lib/Cards";
import CardTitle from "react-md/lib/Cards/CardTitle";
import CardActions from "react-md/lib/Cards/CardActions";
import CardText from "react-md/lib/Cards/CardText";
import Media, {MediaOverlay} from "react-md/lib/Media";
import Avatar from "react-md/lib/Avatars";
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
            .then(() => {
                Session.set("showWait", false);

            })
            .catch(() => {
                Session.set("showWait", false)
            });
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
        const profile = Profiles.findOne({address: add0x(Meteor.user().username)}) || {balance: new BigNumber(0)};
        return (
            <div style={{width: "100%"}}>
                <GetPassword visible={this.state.showUserRegistrationDialog}
                             cost={this.state.transactionCost}
                             balance={profile.balance.toNumber()}
                             confirm={this._transactionConfirmed}
                             cancel={this._transactionCanceled}
                             title="Please confirm this transaction in order to register your account"
                />
                <div className="md-grid md-toolbar-relative">
                    <Card style={{maxWidth: 600}} className="md-cell md-cell--6">
                        <Media>
                            <img src="/images/gold-ounces.jpg" role="presentation"/>
                            <MediaOverlay>
                                <CardTitle title={profile.ozcBalance + " OZC"}
                                           subtitle={"balance for " + profile.alias}>
                                    <Button className="md-cell--right" icon>star_outline</Button>
                                </CardTitle>
                            </MediaOverlay>
                        </Media>
                        <CardTitle
                            avatar={<Avatar src="" role="presentation"/>}
                            title="Card Title"
                            subtitle="Card Subtitle"
                        />
                        <CardActions expander>
                            <Button flat label="Action 1"/>
                            <Button flat label="Action 2"/>
                        </CardActions>
                        <CardText expandable>
                            Lorem Ipsum
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