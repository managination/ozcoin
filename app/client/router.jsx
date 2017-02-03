import React from 'react';
import {Router, Route, browserHistory} from 'react-router';

// route components
import AppContainer from './AppContainer';
import RegistrationDialog from '../imports/components/RegistrationDialog';
import UserDetails from '../imports/components/forms/user-details';

export const renderRoutes = () => (
    <Router history={browserHistory}>
        <Route path="/" component={AppContainer}>
            <Route path="register/:affiliate" component={RegistrationDialog}/>
            <Route path="register" component={RegistrationDialog}/>
            <Route path="*" component={UserDetails}/>
        </Route>
    </Router>
);