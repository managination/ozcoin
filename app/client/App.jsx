import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session'
import React, {PureComponent, PropTypes, cloneElement} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';

import {MenuEntries} from '../imports/api/menuEntries.js';
import RegistrationDialog from '../imports/components/RegistrationDialog';
import Wait from '../imports/components/Wait';

class App extends PureComponent {
    static propTypes = {
        mobile: PropTypes.bool.isRequired,
        tablet: PropTypes.bool.isRequired,
        desktop: PropTypes.bool.isRequired,
        defaultMedia: PropTypes.string.isRequired,
        location: PropTypes.object,
        children: PropTypes.node,
        entries: PropTypes.array,
    };

    constructor (props) {
        super (props);

        this.state = {};
    }

    render () {
        const {
            entries,
            defaultMedia,
            toolbarTitle,
            drawerTitle,
            user,
            initialized,
            showWait,
        } = this.props;

        // const { children } = this.props;
        let menuEntries = entries.map ((entry) => {
            delete entry._id;
            delete entry.role;
            entry.onClick = (event) => {
                alert ("I was clicked")
            };
            if (entry.leftIcon)
                entry.leftIcon = <FontIcon>{entry.leftIcon}</FontIcon>;
            return entry;
        })
        if (initialized) {
            if (user) {
                Session.set ("show-wait", false);
                return (
                    <NavigationDrawer
                        navItems={menuEntries}
                        drawerTitle={drawerTitle}
                        drawerType={NavigationDrawer.DrawerTypes.FULL_HEIGHT}
                        toolbarTitle={toolbarTitle}
                        contentClassName="md-grid"
                    >
                        <div>titi</div>
                        <Wait visible={showWait}/>
                    </NavigationDrawer>
                );
            } else {
                return (
                    <RegistrationDialog/>
                )
            }
        } else {
            return (
                <Wait visible={true}/>
            )
        }
    }
}

export default createContainer (() => {
    return {
        entries: MenuEntries.find ({ role: 'user' }).fetch (),
        user: Meteor.user (),
        initialized: Session.get ('initialized'),
        showWait: Session.get ("show-wait"),
    };
}, App);