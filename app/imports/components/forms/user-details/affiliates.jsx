import React, {PureComponent} from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

import TextField from 'react-md/lib/TextFields'

export default class Affiliate extends TrackerReact(PureComponent) {

    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        return (
            <form className="md-grid">
                < TextField
                    id="companyName"
                    ref="companyName"
                    label="Company Name"
                    placeholder="Company Name"
                    className="md-cell md-cell--4"
                    required
                    defaultValue=""
                />
                < TextField
                    id="website"
                    ref="website"
                    label="Website"
                    placeholder="Website"
                    defaultValue=""
                    className="md-cell md-cell--4"
                    required
                />
                < TextField
                    id="address1"
                    ref="address1"
                    label="Address Line 1"
                    placeholder="Address Line 1"
                    className="md-cell md-cell--4"
                />
                < TextField
                    id="address2"
                    ref="address2"
                    label="Address Line 2"
                    placeholder="Address Line 2"
                    className="md-cell md-cell--4"
                />
                < TextField
                    id="city"
                    ref="city"
                    label="City"
                    placeholder="City"
                    className="md-cell md-cell--4"
                />
                < TextField
                    id="state"
                    ref="state"
                    label="State / Province"
                    placeholder="State / Province"
                    className="md-cell md-cell--4"
                />
                < TextField
                    id="zip"
                    ref="zip"
                    label="Post Code"
                    placeholder="Post Code"
                    className="md-cell md-cell--4"
                />
                < TextField
                    id="country"
                    ref="country"
                    label="Country"
                    placeholder="Country"
                    className="md-cell md-cell--4"
                />
            </form>
        )
    }
}