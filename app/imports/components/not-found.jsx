import React, {PureComponent, PropTypes} from 'react';
import Button from 'react-md/lib/Buttons/Button';
import Media from 'react-md/lib/Media/Media';

export default class NotFound extends PureComponent {

    _handleClick = () => {
        this.props.router.replace('/');
    };

    render() {
        return (
            <Media className="react-md-404-page">
                <img src="/images/404.svg" role="presentation"/>
                <p className="md-display-2">Uhhh...</p>
                <p className="md-headline">Looks like the page can not be found.</p>
                <Button
                    secondary
                    raised
                    onClick={this._handleClick}
                    label="Return Home"
                />
            </Media>
        );
    }
}
