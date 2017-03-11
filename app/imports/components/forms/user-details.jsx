import React, {PureComponent} from "react";
import {EJSON} from "meteor/ejson";
import {Promise} from "meteor/promise";
import {Roles, Profiles, currentProfile} from "../../api/model/profiles";
import {signAndSubmit} from "../../api/ethereum-services";
import FocusContainer from "react-md/lib/Helpers/FocusContainer";
import SelectField from "react-md/lib/SelectFields";
import Button from "react-md/lib/Buttons";
import TextField from "react-md/lib/TextFields";
import Toolbar from "react-md/lib/Toolbars";
import GetPassword from "./confirm-transaction";

export default class UserDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            getPasswordVisible: false,
            _id: false,
            role: Roles.coinowner,
            address: '',
            email: '',
            companyName: '',
            website: '',
            address1: '',
            address2: '',
            city: '',
            zip: '',
            state: '',
            country: '',
        };
        this.user = {};
        this.userDetailsForms = [
            {
                name: 'Coin Owner',
                formIdx: Roles.coinowner
            },
            {
                name: 'Adminitrator',
                formIdx: Roles.administrator
            },
            {
                name: 'Affiliate',
                formIdx: Roles.affiliate
            },
            {
                name: 'Auditor',
                formIdx: Roles.auditor
            },
            {
                name: 'Minter',
                formIdx: Roles.minter
            },
            {
                name: 'Escrow-Agent',
                formIdx: Roles.escrowagent
            },
            {
                name: 'Affiliate Company',
                formIdx: Roles.affiliatecompany
            },
            {
                name: 'Certificate Creator',
                formIdx: Roles.certificatecreator
            },
        ];
        this._handleRoleChange.bind(this);
        this._handleChange.bind(this);
        this._handleSearch.bind(this);
        this._save.bind(this);
        this._reset.bind(this);
    }

    componentWillMount() {
        console.log("user-details will mount");
        if (this.props.params.address) {
            this._handleSearch(this.props.params.address);
            delete this.props.params.address;
        }
    }

    _handleRoleChange = (value, index, event) => {
        this.roleChanged = true;
        this.user.role = value;
        this.setState({role: value});
    };

    _handleChange = (value, event) => {
        if (event.target.id === 'address') {
            this._handleSearch(value);
        }
        this.user[event.target.id] = value;
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };

    _handleSearch = (address) => {
        this.setState({
            address: '',
            email: '',
            companyName: '',
            website: '',
            address1: '',
            address2: '',
            city: '',
            zip: '',
            state: '',
            country: ''
        });
        let self = this;
        if (this.profileSub) this.profileSub.stop();
        this.profileSub = Meteor.subscribe("user-profile", address, () => {
            this.user = Profiles.findOne({address: address}, {fields: {owner: 0}}) || {
                    _id: false,
                    address: address || ''
                };
            self.setState(this.user);
        })
    };

    _save = () => {
        let self = this;
        this.password = undefined;
        let user = EJSON.clone(this.user);
        user.balance = this.user.balance.toNumber();
        user.ozcBalance = this.user.ozcBalance.toNumber();

        Meteor.callPromise('update-user-details', user)
            .then((response) => {
                if (!response.zeroBalance) {
                    response.getPasswordVisible = true;
                    Session.set("showWait", false);
                    self.setState(response);
                }
            })
            .catch((err) => {
                console.log(err);
                Session.set("showWait", false);
            });
    };

    _reset = () => {
        const profile = currentProfile();

        if (profile.role != Roles.administrator)
            this._handleSearch(profile.address);
        else
            this._handleSearch('');
    };

    _transactionConfirmed = (password) => {
        let self = this;
        this.setState({getPasswordVisible: false});
        Session.set("showWait", true);
        signAndSubmit(password, this.state.rawTx, false)
            .then(() => {
                /**it is necessary to set the role if the role has changed or if the initial role is not coinowner*/
                if (self.roleChanged) {
                    return Meteor.callPromise('change-user-role', self.state.address, self.state.role)
                }
                throw new Meteor.Error("nothing to do");
            })
            .then((result) => signAndSubmit(password, result.rawTx, true))
            .then(() => Session.set("showWait", false))
            .catch(() => Session.set("showWait", false));
    };

    _transactionCanceled = () => {
        Session.set("showWait", false);
        this.setState({getPasswordVisible: false});
    };

    render() {
        const profile = currentProfile();

        return (
            <div>
                <GetPassword visible={this.state.getPasswordVisible}
                             cost={this.state.transactionCost}
                             balance={profile.balance.toNumber()}
                             confirm={this._transactionConfirmed}
                             cancel={this._transactionCanceled}
                             title={"Enter our password to validate the transaction"}
                />

                <FocusContainer
                    focusOnMount
                    component="div"
                    className="toolbar-group md-toolbar-relative"
                    initialFocus="#address"
                >
                    <Toolbar themed>
                        <SelectField
                            id="states"
                            ref="state"
                            label="Select a user role"
                            value={this.state.role}
                            menuItems={this.userDetailsForms}
                            itemLabel="name"
                            itemValue="formIdx"
                            className="md-cell md-cell--4"
                            onChange={this._handleRoleChange}
                            disabled={profile.role != Roles.administrator}
                            helpText="Select a role for the user"
                        />,
                        <TextField
                            id="address"
                            ref="address"
                            label="address"
                            value={this.state.address}
                            className="md-cell md-cell--4"
                            disabled={profile.role != Roles.administrator}
                            required
                            onChange={this._handleChange}
                            helpText="enter an ethereum address"
                        />,
                        <TextField
                            id="email"
                            ref="email"
                            label="e-mail"
                            value={this.state.email}
                            className="md-cell md-cell--4"
                            onChange={this._handleChange}
                            disabled={true}
                        />,
                        {/*
                         <Button className="md-cell md-cell--4" flat primary label="Search"
                         onClick={this._requestAccess}>
                         Request Role
                         </Button>
                         */}
                    </Toolbar>
                </FocusContainer>
                <div>
                    <form id="user-details" className="md-grid" onSubmit={(e) => e.preventDefault()}>
                        < TextField
                            id="companyName"
                            ref="companyName"
                            label="Company Name"
                            placeholder="Company Name"
                            className="md-cell md-cell--4"
                            required
                            disabled={!this.state._id}
                            onChange={this._handleChange}
                            value={this.state.companyName}
                        />
                        < TextField
                            id="website"
                            ref="website"
                            label="Website"
                            placeholder="Website"
                            className="md-cell md-cell--4"
                            required
                            disabled={!this.state._id}
                            value={this.state.website}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="address1"
                            ref="address1"
                            label="Address Line 1"
                            placeholder="Address Line 1"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.address1}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="address2"
                            ref="address2"
                            label="Address Line 2"
                            placeholder="Address Line 2"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.address2}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="city"
                            ref="city"
                            label="City"
                            placeholder="City"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.city}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="state"
                            ref="state"
                            label="State / Province"
                            placeholder="State / Province"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.state}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="zip"
                            ref="zip"
                            label="Post Code"
                            placeholder="Post Code"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.zip}
                            onChange={this._handleChange}
                        />
                        < TextField
                            id="country"
                            ref="country"
                            label="Country"
                            placeholder="Country"
                            className="md-cell md-cell--4"
                            disabled={!this.state._id}
                            value={this.state.country}
                            onChange={this._handleChange}
                        />
                    </form>

                </div>
                <div className="bottom-right">
                    <Button floating primary onClick={this._save} tooltipLabel="save changes" tooltipPosition="top">cloud_upload</Button>
                    <Button floating primary onClick={this._reset} tooltipLabel="reset changes" tooltipPosition="top">cancel</Button>
                </div>
            </div>
        )
    }
}