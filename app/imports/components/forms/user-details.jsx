import React, {PureComponent} from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import {ReactiveVar} from 'meteor/reactive-var'

import SelectField from 'react-md/lib/SelectFields';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import Toolbar from 'react-md/lib/Toolbars';
import BottomNavigation from 'react-md/lib/BottomNavigations';

import Affiliate from './user-details/affiliates';
import Auditor from './user-details/auditors';
import {Roles} from '../../api/profiles';
import {Profiles} from '../../api/profiles';

export default class UserDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeForm: <Affiliate/>,
            selectedForm: Roles.affiliate,
            email: '',
            user: {
                _id: false,
                role: Roles.administrator,
                email: '',
                companyName: '',
            },
        };
        this.userDetailsForms = [
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
        this._save.bind(this);
        this._reset.bind(this);
    }

    componentWillMount() {
        console.log('user-details componentWillMount');
        if (this.props.params.email) {
            this._handleSearch(this.props.params.email);
            delete this.props.params.email;
        }
    }

    _handleRoleChange = (value, index, event) => {
        this.setState({selectedForm: value});
    };

    _handleChange = (value, event) => {
        if (event.target.id === 'email' && this.state.user._id) {
            this._handleSearch(value);
        }
        this.setState({email: value});
    };

    _handleSearch = (email) => {
        let self = this;
        if (this.profileSub) this.profileSub.stop();
        this.profileSub = Meteor.subscribe("user-profile", email, () => {
            let user = Profiles.findOne({email: email}) || {_id: false, email: email || ''};
            user.role = typeof user.role == 'undefined' ? Roles.minter : user.role;
            user.companyName = user.companyName || '';
            /*
             this.user.email = user.email || ' ';
             this.user.address1 = user.address1 || ' ';
             this.user.address2 = user.address2 || ' ';
             this.user.website = user.website || ' ';
             this.user.city = user.city || ' ';
             this.user.state = user.state || ' ';
             this.user.zip = user.zip || ' ';
             this.user.country = user.country || ' ';
             */
            self.setState({user: user});
            self.setState({email: user.email || ''});

            if (self.state.user.role) {
                self.setState({selectedForm: self.state.user.role});
            }
        })
    };

    _save = () => {
        let user = this.state.user;
        delete user._id;
        Profiles.update({_id: this.state.user._id}, {$set: user}, (err, docCount) => {
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
                <div className="toolbar-group md-toolbar-relative md-grid">
                    <Toolbar themed>
                        <SelectField
                            id="states"
                            ref="state"
                            label="Select a user role"
                            value={this.state.user.role}
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
                            helpText="enter an e-mail address and press search"
                        />,
                        <Button className="md-cell md-cell--4" flat primary label="Search" onClick={this._handleSearch}>
                            search
                        </Button>
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
                            disabled={!this.state.user._id}
                            onChange={this._handleChange}
                            value={this.state.user.companyName}
                        />
                        {/*
                         < TextField
                         id="website"
                         ref="website"
                         label="Website"
                         placeholder="Website"
                         className="md-cell md-cell--4"
                         required
                         disabled={!this.state.user._id}
                         value={this.state.user.website}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="address1"
                         ref="address1"
                         label="Address Line 1"
                         placeholder="Address Line 1"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.address1}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="address2"
                         ref="address2"
                         label="Address Line 2"
                         placeholder="Address Line 2"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.address2}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="city"
                         ref="city"
                         label="City"
                         placeholder="City"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.city}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="state"
                         ref="state"
                         label="State / Province"
                         placeholder="State / Province"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.state}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="zip"
                         ref="zip"
                         label="Post Code"
                         placeholder="Post Code"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.zip}
                         onChange={this._handleChange}
                         />
                         < TextField
                         id="country"
                         ref="country"
                         label="Country"
                         placeholder="Country"
                         className="md-cell md-cell--4"
                         disabled={!this.state.user._id}
                         value={this.state.user.country}
                         onChange={this._handleChange}
                         />
                         */}
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