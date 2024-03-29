import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {browserHistory} from "react-router";
import React, {PureComponent, PropTypes, cloneElement} from "react";
import {createContainer} from "meteor/react-meteor-data";
import NavigationDrawer from "react-md/lib/NavigationDrawers";
import Button from "react-md/lib/Buttons";
import MenuButton from "react-md/lib/Menus/MenuButton";
import ListItem from "react-md/lib/Lists/ListItem";
import CopyToClipboard from "react-copy-to-clipboard";
import Snackbar from "react-md/lib/Snackbars";
import Wait from "../imports/components/wait";
import CopyMnemonic from "../imports/components/forms/copy-mnemonic";
import {Profiles, currentProfile} from "../imports/api/model/profiles";
import menuEntries from "../imports/components/menus/main-menu";

export default class AppContainer extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);
        this.state = {
            copiedAddress: '',
            toasts: [],
            autohide: true,
            autohideTimeout: 0,
        };
        Session.set("showWait", false);
        Session.set("showCopyMnemonic", false);

        this._showToast = this._showToast.bind(this);
        this._removeToast = this._removeToast.bind(this);
        this._copyMnemonic = this._copyMnemonic.bind(this);
        this._showAddressCopiedToast = this._showAddressCopiedToast.bind(this);
        this._showAccRefCopiedToast = this._showAccRefCopiedToast.bind(this);
    }

    componentWillMount() {
        console.log("componentWillMount app.jsx");
        const user = Meteor.user();
        if (user) {
            let profile = currentProfile();
            if (this.props.location.pathname.indexOf('register') >= 0 && profile && profile.address) {
                browserHistory.push('/edit-user/' + profile.address);
            } else if (this.props.location.pathname == '/') {
                browserHistory.push('/wallet');
            }
        } else {
            if (this.props.location.pathname.indexOf('register') == -1) {
                Session.set('initialLocation', this.props.location.pathname);
                browserHistory.push('/register');
            }
        }
    }

    static componentWillReceiveProps() {
        console.log("componentWillReceiveProps app.jsx");
    }

    _showToast(text) {
        const action = undefined;
        const toasts = this.state.toasts.slice();
        toasts.push({text, action});

        const autohideTimeout = Snackbar.defaultProps.autohideTimeout;

        this.setState({toasts, autohideTimeout});
    };

    _showAddressCopiedToast() {
        this._showToast("address copied");
    }

    _showAccRefCopiedToast() {
        this._showToast("address copied");
    }

    _removeToast() {
        const [, ...toasts] = this.state.toasts;
        this.setState({toasts});
    }

    _copyMnemonic() {
        Session.set("showCopyMnemonic", true);
    }

    render() {
        console.log("rendering app.jsx");
        let self = this;
        let toolbarMenuItems = Profiles.find().fetch().map((profile) => {
            return (
                <ListItem key={profile._id} primaryText={profile.alias}
                          onClick={() => {
                              Session.set('currentProfile', profile._id)
                          }}/>

            );
        });
        toolbarMenuItems.push(
            <ListItem key="copyMnemonic" primaryText="Copy mnemonic"
                      onClick={this._copyMnemonic}/>
        );
        let profile = currentProfile();
        let affiliateLink = location.protocol + "//" + location.hostname;
        if (location.port.length > 0)
            affiliateLink += ":" + location.port;
        affiliateLink += "/register/" + profile.address;

        toolbarMenuItems.push(
            <CopyToClipboard key="copyAffiliateLink"
                             text={affiliateLink}
                             onCopy={() => this._showToast("registration URL copied")}>
                <ListItem key="copyAffiliateLink" primaryText="Copy Registration link"/>
            </CopyToClipboard>
        );
        this.actions = [
            <Button key="refresh" icon onClick={
                () => {
                    Session.set("showWait", true);
                    Meteor.call('update-balance', () => {
                        Session.set("showWait", false);
                    });
                }}>refresh</Button>,
            <MenuButton id="aliases" buttonChildren="more_vert" key="menu" icon>
                {toolbarMenuItems}
            </MenuButton>
        ];

        this.state.initialized = Session.get('initialized');

        const menuItems = menuEntries(profile, this.props.location.pathname);
        const toolbarTitle = (<div>
                <span>{profile.alias}</span>
                <span> - </span>
                <CopyToClipboard text={profile.address || ''}
                                 onCopy={this._showAddressCopiedToast}>
                    <Button flat iconBefore={false}
                            label={profile.address}
                            tooltipLabel="click here to copy the address">content_copy</Button>
                </CopyToClipboard>
                <CopyToClipboard text={"#" + (profile.userNum + 1000) || ''}
                                 onCopy={this._showAccRefCopiedToast}>
                    <Button flat iconBefore={false}
                            label={"Acc Ref: #" + (profile.userNum + 1000)}
                            tooltipLabel="click here to copy the account reference">content_copy</Button>
                </CopyToClipboard>
            </div>
        );

        // const { children } = this.props;
        if (this.state.initialized) {
            Session.set("show-wait", false);
            let children = null;
            if (this.props.children)
                children = React.Children.toArray(this.props.children).map(function (item, i) {
                    return React.cloneElement(
                        item,
                        {_showToast: self._showToast}
                    );
                }, this);
            return (
                <NavigationDrawer
                    navItems={menuItems}
                    drawerTitle={"OzGLD"}
                    desktopDrawerType={NavigationDrawer.DrawerTypes.FULL_HEIGHT}
                    contentClassName="md-grid"
                    autoclose={true}
                    toolbarTitle={toolbarTitle}
                    toolbarActions={this.actions}
                >
                    <div style={{width: "100%"}}>
                        {children}
                        <Wait visible={Session.get("showWait")}/>
                        <CopyMnemonic visible={Session.get("showCopyMnemonic")}
                                      showToast={this._showToast}/>
                    </div>
                    <Snackbar toasts={this.state.toasts} autohide={this.state.autohide} onDismiss={this._removeToast}/>
                </NavigationDrawer>
            );
        } else {
            return (
                <Wait visible={true}/>
            )
        }

    }
}
