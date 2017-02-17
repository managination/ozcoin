import React, {PureComponent} from 'react';
import {EJSON} from 'meteor/ejson';

import SelectField from 'react-md/lib/SelectFields';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import Toolbar from 'react-md/lib/Toolbars';

import {Roles} from '../../api/model/profiles';
import {Profiles} from '../../api/model/profiles';

export default class UserDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            _id: false,
            role: Roles.administrator,
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
                name: 'Resource Company',
                formIdx: Roles.certificatecreator
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
        this._handleSearchButton.bind(this);
        this._save.bind(this);
        this._reset.bind(this);
    }

    componentWillMount() {
        if (this.props.params.email) {
            this._handleSearch(this.props.params.email);
            delete this.props.params.email;
        }
    }

    _handleRoleChange = (value, index, event) => {
        this.user.role = value;
        this.setState({role: value});
    };

    _handleChange = (value, event) => {
        if (event.target.id === 'email') {
            this._handleSearch(value);
        }
        this.user[event.target.id] = value;
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };

    _handleSearch = (email) => {
        let self = this;
        if (this.profileSub) this.profileSub.stop();
        this.profileSub = Meteor.subscribe("user-profile", email, () => {
            this.user = Profiles.findOne({email: email}, {fields: {owner: 0}}) || {_id: false, email: email || ''};
            self.setState(this.user);
        })
    };

    _handleSearchButton = () => {
        this._handleSearch(this.state.email);
    };

    _save = () => {
        let user = EJSON.clone(this.user);
        delete user._id;
        Profiles.update({_id: this.user._id}, {$set: user}, (err, docCount) => {
            console.log(err, docCount);
        });
    };

    _reset = () => {
        this.email = '';
        this._handleSearch('');
    };

    render() {
        console.log("rendering user-details");
        return (
            <div>
                <div className="toolbar-group md-toolbar-relative">
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
                            helpText="Select a role for the user"
                        />,
                        <TextField
                            id="email"
                            ref="email"
                            label="e-mail"
                            value={this.state.email}
                            className="md-cell md-cell--4"
                            required
                            onChange={this._handleChange}
                            helpText="enter an e-mail address. The search is automatic"
                        />,
                        {/*
                         <Button className="md-cell md-cell--4" flat primary label="Search"
                         onClick={this._handleSearchButton}>
                            search
                        </Button>
                         */}
                    </Toolbar>
                </div>
                <div>
                    <form id="user-details" className="md-grid">
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