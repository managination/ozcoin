import React, {PureComponent} from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

import TextField from 'react-md/lib/TextFields'

export default class Auditors extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        console.log("rendering auditor form");
        let user = this.props.user || {};
        return (
            <form className="md-grid">
                < TextField
                    id="companyName"
                    ref="companyName"
                    label="Company Name"
                    placeholder="Company Name"
                    className="md-cell md-cell--4"
                    required
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="address1"
                    ref="address1"
                    label="Address Line 1"
                    placeholder="Address Line 1"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="address2"
                    ref="address2"
                    label="Address Line 2"
                    placeholder="Address Line 2"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="city"
                    ref="city"
                    label="City"
                    placeholder="City"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="state"
                    ref="state"
                    label="State / Province"
                    placeholder="State / Province"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="zip"
                    ref="zip"
                    label="Post Code"
                    placeholder="Post Code"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
                < TextField
                    id="country"
                    ref="country"
                    label="Country"
                    placeholder="Country"
                    className="md-cell md-cell--4"
                    disabled={!user._id}
                    defaultValue={user.companyName}
                />
            </form>
        )
    }
}