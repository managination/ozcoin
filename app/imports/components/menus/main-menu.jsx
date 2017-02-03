import React from 'react';
import FontIcon from 'react-md/lib/FontIcons';

export default entries = (user, tracker) => {
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
                    // tracker.set('activeMenu', entry);
                    console.log(entry);
                };
                return entry;
            }
        } catch (err) {

        }
        return undefined;
    }).filter(entry => typeof entry != 'undefined');
}