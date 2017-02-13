import React from 'react';
import FontIcon from 'react-md/lib/FontIcons';
import {browserHistory} from 'react-router';

import {Roles} from '../../api/profiles';

export default entries = (user, path) => {

    return [{
        key: 'edit-user',
        primaryText: 'Edit User Details',
        leftIcon: <FontIcon>android</FontIcon>,
        roles: [Roles.administrator],
        active: path.indexOf('edit-user') > -1,
        onClick: () => browserHistory.push('/edit-user'),
    }, {
        key: 'wallet',
        primaryText: 'Wallet',
        leftIcon: <FontIcon>account_balance_wallet</FontIcon>,
        roles: [Roles.all],
        active: path.indexOf('wallet') > -1,
        onClick: () => browserHistory.push('/wallet'),
    }, {
        key: 'upoload-certificate',
        primaryText: 'Proof of Asset',
        leftIcon: <FontIcon>fingerprint</FontIcon>,
        roles: [Roles.certificatecreator, Roles.administrator],
        active: path.indexOf('upload/certificate') > -1,
        onClick: () => browserHistory.push('/upload/certificate'),
    }, {
        key: 'upload-audit-report',
        primaryText: 'Audit Report',
        leftIcon: <FontIcon>send</FontIcon>,
        roles: [Roles.auditor, Roles.administrator],
        active: path.indexOf('upload/audit-report') > -1,
        onClick: () => browserHistory.push('/upload/audit-report'),
    }, /*{ key: 'divider', divider: true },*/].map((entry) => {
        if (entry.key === 'divider') return entry;

        try {
            if (entry.roles.indexOf(Roles.all) > -1 || entry.roles.indexOf(user.role) > -1) {
                delete entry.roles;
                let click = entry.onClick;
                entry.onClick = (event) => {
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