import {Meteor} from 'meteor/meteor';
import {render} from 'react-dom';
import {renderRoutes} from './router';
import React from 'react';

import Wait from '../imports/components/wait';

import {initializeKeystore} from '../imports/api/ethereum-services';

if (!window.console) {
    window.console = {
        log: function () {
            //do nothing this is just for IE
        }
    }
}

Meteor.startup(() => {
    render(<Wait visible={true}/>, document.getElementById('render-target'));
    initializeKeystore().then((keystore) => {
        Session.set('initialized', true);
        render(renderRoutes(), document.getElementById('render-target'));
    })

});