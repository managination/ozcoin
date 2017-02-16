import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session'
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import {browserHistory} from 'react-router';

import React, {PureComponent, PropTypes, cloneElement} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';
import Button from 'react-md/lib/Buttons';
import MenuButton from 'react-md/lib/Menus/MenuButton';
import ListItem from 'react-md/lib/Lists/ListItem';

import Wait from '../imports/components/Wait';
import {Profiles} from '../imports/api/profiles';
import menuEntries from '../imports/components/menus/main-menu';

export default class AppContainer extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);
        this.state = {

        };
        Session.set("showWait", false);
        Session.set('currentProfile', {alias: 'Please login'});

        Meteor.subscribe('current-profile', () => {
            if (Profiles.find({}).count() == 0) {
                Session.set('currentProfile', {alias: 'Please login'});
            } else {
                Session.set('currentProfile', Profiles.findOne({address: Meteor.user().username}))
            }
        });
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

    render() {
        console.log("rendering app.jsx");

        this.actions = [
            <Button key="search" icon>search</Button>,
            <MenuButton id="aliases" buttonChildren="more_vert" key="menu" icon>
                {Profiles.find().fetch().map((profile) => {
                    return <ListItem key={profile._id} primaryText={profile.alias}
                                     onClick={Session.set('activeProfile', profile)}/>;
                })}
            </MenuButton>
        ];

        this.state.initialized = Session.get('initialized');
        this.state.showWait = Session.get("showWait");

        const menuItems = menuEntries(Session.get('currentProfile'), this.props.location.pathname);

        // const { children } = this.props;
        if (this.state.initialized) {
            Session.set("show-wait", false);
            return (
                <NavigationDrawer
                    navItems={menuItems}
                    drawerTitle={"Oz-Coins"}
                    desktopDrawerType={NavigationDrawer.DrawerTypes.FULL_HEIGHT}
                    contentClassName="md-grid"
                    autoclose={true}
                    toolbarTitle={Session.get('currentProfile').alias}
                    toolbarActions={this.actions}
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
