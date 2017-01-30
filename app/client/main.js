import React from 'react';
import {Meteor} from 'meteor/meteor';
import {render} from 'react-dom';

import App from './App';

Meteor.startup (() => {

    render (<App
        visibleBoxShadow={true}
        visibleToolbarTitle={true}
        toolbarTitle={"Oz-Coins"}
        drawerTitle={"Actions"}
        toolbarProminent={true}
        onMediaTypeChange={() => undefined}
        setCustomTheme={() => undefined}
        defaultMedia={'desktop'}
        mobile={false}
        tablet={false}
        desktop={true}
    />, document.getElementById ('render-target'));
});