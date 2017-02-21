import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import './api/ethereum';
import './api/server-methods';

const THROTTLE_METHODS = _.chain(Meteor.server.method_handlers)
    .keys()
    // .filter(k=> k.includes('.methods.'))
    .value();

DDPRateLimiter.addRule({
    name(name) {
        return _.contains(THROTTLE_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() {
        return true;
    },
}, 5, 1000);