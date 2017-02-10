import React from 'react';
import FontIcon from 'react-md/lib/FontIcons';
import {browserHistory} from 'react-router';

import {Roles} from '../../api/profiles';

export default entries = (user, tracker) => {
    return [{
        key: 'edit-user',
        primaryText: 'Register User',
        leftIcon: <FontIcon>android</FontIcon>,
        role: Roles.all,
        active: tracker.get().key == 'edit-user',
        onClick: () => browserHistory.push('/edit-user'),
    }, {
        key: 'wallet',
        primaryText: 'Wallet',
        leftIcon: <FontIcon>account_balance_wallet</FontIcon>,
        role: Roles.all,
        active: tracker.get().key == 'wallet',
        onClick: () => browserHistory.push('/wallet'),
    }, {
        key: 'upoload-certificate',
        primaryText: 'Proof of Asset',
        leftIcon: <FontIcon>fingerprint</FontIcon>,
        role: Roles.all,
        active: tracker.get().key == 'upoload-certificate',
        onClick: () => browserHistory.push('/upload/certificate'),
    }, {
        key: 'upload-audit-report',
        primaryText: 'Audit Report',
        leftIcon: <FontIcon>send</FontIcon>,
        role: Roles.all,
        active: tracker.get().key == 'upload-audit-report',
        onClick: () => browserHistory.push('/upload/audit'),
    }, /*{ key: 'divider', divider: true },*/].map((entry) => {
        if (entry.key === 'divider') return entry;

        try {
            if (entry.role == Roles.all || user.profile.roles.indexOf(entry.role) >= 0) {
                delete entry.role;
                // entry.active = tracker.get('activeMenu').key == entry.key;
                let click = entry.onClick;
                entry.onClick = (event) => {
                    entry.active = true;
                    tracker.get().active = false;
                    tracker.set(entry);
                    if (typeof click == 'function') {
                        click();
                    }
                };
                return entry;
            }
        } catch (err) {

        }
        return undefined;
    }).filter(entry => typeof entry != 'undefined');
}