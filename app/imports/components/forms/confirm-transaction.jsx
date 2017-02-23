import React, {PureComponent, PropTypes} from "react";
import {createContainer} from "meteor/react-meteor-data";
import Dialog from "react-md/lib/Dialogs";
import Toolbar from "react-md/lib/Toolbars";
import TextField from "react-md/lib/TextFields";
import Button from "react-md/lib/Buttons";

export default class TransactionConfirmationOverlay extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {pageX: 1, pageY: 1, ksPassword: ''};
        this._handleChange.bind(this);
    }

    componentWillMount() {
        console.log("TransactionConfirmationOverlay will mount");
        this._confirm = this.props.confirm;
        this._cancel = this.props.cancel;
    }

    _handleChange = (value, event) => {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };

    render() {
        const {visible, cost, balance} = this.props;
        const title = this.props.title || "Please confirm or cancel this transaction";
        return (
            <Dialog
                id="RegistrationConfirmationOverlay"
                visible={visible}
                fullPage
                aria-label="dialogLabel"
                focusOnMount={false}
            >
                <Toolbar
                    colored
                    title={title}
                    fixed
                />
                <form className="md-toolbar-relative md-grid" onSubmit={(e) => e.preventDefault()}>
                    <div className="md-cell--12">
                        <h1>Transaction costs {cost} ETH your balance is {balance} ETH</h1>
                    </div>
                    <TextField
                        id="ksPassword"
                        label="password"
                        placeholder=""
                        customSize="title"
                        className="md-cell md-cell--12"
                        required
                        onChange={this._handleChange}
                        type="password"
                    />
                    <Button id="confirm"
                            primary raised
                            label="Confirm"
                            onClick={() => this._confirm(this.state.ksPassword)}
                    >done</Button>
                    <Button style={{marginLeft: 20}}
                            id="cancel"
                            secondary raised
                            label="Cancel"
                            onClick={this._cancel}
                    >cancel</Button>

                </form>
            </Dialog>
        );
    }
}

TransactionConfirmationOverlay.propTypes = {
    cost: PropTypes.number,
    balance: PropTypes.number,
    confirm: PropTypes.func,
    cancel: PropTypes.func,
};
