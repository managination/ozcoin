import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session'
import {ReactiveVar} from 'meteor/reactive-var'
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import {browserHistory} from 'react-router';

import React, {PureComponent, PropTypes, cloneElement} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import FontIcon from 'react-md/lib/FontIcons';

import Wait from '../imports/components/Wait';

export default class AppContainer extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);
        this.state = {
            activeMenu: new ReactiveVar({key: 'none'}, (oldVal, newVal) => oldVal.key && newVal.key && oldVal.key == newVal.key)
        };
        Session.set("showWait", false);
        console.log("constructing app.jsx");

    }

    componentWillMount() {
        console.log("componentWillMount app.jsx");
        const user = Meteor.user();
        if (user) {
            if (this.props.location.pathname.indexOf('register') >= 0) {
                browserHistory.push('/');
            }
        } else {
            if (this.props.location.pathname.indexOf('register') == -1) {
                Session.set('initialLocation', this.props.location.pathname);
                browserHistory.push('/register');
            }
        }
    }

    componentWillReceiveProps() {
        console.log("componentWillReceiveProps app.jsx");
    }

    menuEntries(user, tracker) {
        return [{
            key: 'wallet',
            primaryText: 'Wallet',
            leftIcon: <FontIcon>account_balance_wallet</FontIcon>,
            role: 'All',
            active: tracker.get().key == 'wallet',
        }, {
            key: 'register-user',
            primaryText: 'Register User',
            leftIcon: <FontIcon>android</FontIcon>,
            role: 'Administrator',
            active: tracker.get().key == 'register-user',
        }, {
            key: 'upoload-certificate',
            primaryText: 'Proof of Asset',
            leftIcon: <FontIcon>fingerprint</FontIcon>,
            role: 'CertificateCreator',
            active: tracker.get().key == 'upoload-certificate',
        }, {
            key: 'upload-audit-report',
            primaryText: 'Audit Report',
            leftIcon: <FontIcon>send</FontIcon>,
            role: 'Auditor',
            active: tracker.get().key == 'upload-audit-report',
        }, /*{ key: 'divider', divider: true },*/].map((entry) => {
            if (entry.key === 'divider') return entry;

            try {
                if (entry.role == 'All' || user.profile.roles.indexOf(entry.role) >= 0) {
                    delete entry.role;
                    // entry.active = tracker.get('activeMenu').key == entry.key;
                    entry.onClick = (event) => {
                        entry.active = true;
                        tracker.get().active = false;
                        tracker.set(entry);
                    };
                    return entry;
                }
            } catch (err) {

            }
            return undefined;
        }).filter(entry => typeof entry != 'undefined');
    }

    render() {
        console.log("rendering app.jsx");
        const {
            toolbarTitle,
            drawerTitle,
        } = this.props;

        this.state.initialized = Session.get('initialized');
        this.state.showWait = Session.get("showWait");

        const menuItems = this.menuEntries(Meteor.user(), this.state.activeMenu);
        this.state.activeMenu.set(this.state.activeMenu.get().key != 'none' ? this.state.activeMenu.get() : menuItems[0]);
        this.state.activeMenu.get().active = true;

        // const { children } = this.props;
        if (this.state.initialized) {
            Session.set("show-wait", false);
            return (
                <NavigationDrawer
                    navItems={menuItems}
                    drawerTitle={"Actions"}
                    desktopDrawerType={NavigationDrawer.DrawerTypes.FULL_HEIGHT}
                    toolbarTitle={"Oz-Coin"}
                    contentClassName="md-grid"
                    autoclose={true}
                >
                    <div>
                        {this.props.children}
                        <Wait visible={this.state.showWait}/>
                    </div>
                </NavigationDrawer>
            );
        } else {
            return (
                <Wait visible={true}/>
            )
        }
    }
}

/*createContainer (() => {
 return {
 entries: MenuEntries.find ({ role: 'user' }).fetch (),
 user: Meteor.user (),
 initialized: Session.get ('initialized'),
 showWait: Session.get ("show-wait"),
 };
 }, App);*/