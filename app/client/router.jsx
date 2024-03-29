import React from "react";
import {Router, Route, browserHistory} from "react-router";
// route components
import AppContainer from "./appContainer";
import RegistrationDialog from "../imports/components/forms/registrationDialog";
import UserDetails from "../imports/components/forms/user-details";
import FileUpload from "../imports/components/forms/file-upload";
import TransactionConfirmationOverlay from "../imports/components/forms/confirm-transaction";
import Wallet from "../imports/components/wallet";
import NotFound from "../imports/components/not-found";
import DelayNotification from "../imports/components/delayNotification";
import InformationPage from "../imports/components/information-page";

export const renderRoutes = () => (
    <Router history={browserHistory}>
        <Route path="/confirm" component={TransactionConfirmationOverlay}/>
        <Route path="/delay-notification" component={DelayNotification}/>
        <Route path="/" component={AppContainer}>
            <Route path="registration/:register" component={Wallet}/>
            <Route path="wallet" component={Wallet}/>
            <Route path="edit-user/:address" component={UserDetails}/>
            <Route path="edit-user" component={UserDetails}/>
            <Route path="upload/:docType" component={FileUpload}/>
            <Route path="register/:affiliate" component={RegistrationDialog}/>
            <Route path="register" component={RegistrationDialog}/>
            <Route path="info-page" component={InformationPage}/>
            <Route path="info-page/:firstTime" component={InformationPage}/>
            <Route path="*" component={NotFound}/>
        </Route>

    </Router>
);