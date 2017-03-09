import React, {PureComponent} from 'react';
import {createContainer} from 'meteor/react-meteor-data';

import Dialog from 'react-md/lib/Dialogs';
import Toolbar from 'react-md/lib/Toolbars';
import Card from 'react-md/lib/Cards';
import Media, {MediaOverlay} from 'react-md/lib/Media';

export default class WaitOverlay extends PureComponent {
    constructor (props) {
        super (props);

        this.state = { visible: true, pageX: 1, pageY: 1 };
    }

    render () {
        const { visible } = this.props;
        this.state.visible = !(!visible);
        return (
            <Dialog
                id="delayNotificationOverlay"
                {...this.state}
                fullPage
                aria-label="dialogLabel"
                focusOnMount={false}
            >
                <Toolbar
                    colored
                    title="Thank you for your OZcoinGold Wallet registration"
                    fixed
                />
                <div style={{marginTop: 100}}>
                    <Card style={{ maxWidth: 600 }} className="md-block-centered">
                        <Media>
                            <img src="/images/gold-ounces.jpg" role="presentation"/>
                            <MediaOverlay>
                                <CardTitle
                                    title="Thank you for your OZcoinGold Wallet registration"
                                    subtitle="We are committed to providing exceptional customer service and will notify you as soon as you OzGLD Wallet is activated">
                                </CardTitle>
                            </MediaOverlay>
                        </Media>
                    </Card>
                </div>
            </Dialog>
        );
    }
}
