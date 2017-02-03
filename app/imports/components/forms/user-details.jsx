import TrackerReact from 'meteor/ultimatejs:tracker-react';
import React, {PureComponent} from 'react';

export default class UserDetails extends TrackerReact(PureComponent) {
    render() {
        return (
            <div>these are user details</div>
        )
    }
}