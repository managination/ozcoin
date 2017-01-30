import {MenuEntries} from '../imports/api/menuEntries.js';

Meteor.startup (() => {
    if (MenuEntries.find ().count () == 0) {
        inboxListItems = [{
            key: 'inbox',
            primaryText: 'Inbox',
            leftIcon: 'inbox',
            active: true,
            role: 'user'
        }, {
            key: 'starred',
            primaryText: 'Starred',
            leftIcon: 'star',
            role: 'user'
        }, {
            key: 'send-mail',
            primaryText: 'Send mail',
            leftIcon: 'send',
        }, {
            key: 'drafts',
            primaryText: 'Drafts',
            leftIcon: 'drafts',
        }, {key: 'divider', divider: true}, {
            key: 'all-mail',
            primaryText: 'All mail',
            leftIcon: 'mail',
        }, {
            key: 'trash',
            primaryText: 'Trash',
            leftIcon: 'delete',
            role: 'admin'
        }, {
            key: 'spam',
            primaryText: 'Spam',
            leftIcon: 'info',
            role: 'admin'
        }];

        inboxListItems.forEach ((listItem) => MenuEntries.insert (listItem));
    }
});
