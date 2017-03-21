import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import FileInput from "react-md/lib/FileInputs";
import Button from "react-md/lib/Buttons";
import TextField from "react-md/lib/TextFields";
import List from "react-md/lib/Lists/List";
import ListItem from "react-md/lib/Lists/ListItem";
import Avatar from "react-md/lib/Avatars";
import FontIcon from "react-md/lib/FontIcons";
import Subheader from "react-md/lib/Subheaders";
import {signAndSubmit} from "../../../imports/ethereum/ethereum-services";
import GetPassword from "./confirm-transaction";
import {Documents} from "../../api/model/documents";
import {Roles, currentProfile} from "../../api/model/profiles";

const InfoIcon = () => <FontIcon>info</FontIcon>;

export default class FileUpload extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            file: null,
            fileName: '',
            documentId: '',
            getPasswordVisible: false,
        };

        this._selectFile.bind(this);
        this._handleChange.bind(this);
        this._uploadFile.bind(this);
        this._transactionConfirmed.bind(this);
        this._transactionCanceled.bind(this);

        Meteor.subscribe('documents');

    }

    _selectFile = (file) => {
        if (!file) {
            return;
        }
        this.setState({file, fileName: file.name, documentId: file.name});
    };

    _handleChange = (value, event) => {
        if (event.target.id === 'email') {
            this._handleSearch(value);
        }
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    };

    _uploadFile = () => {
        let self = this;
        Session.set("showWait", true);
        let fileName = this.state.fileName;
        let documentId = this.state.documentId;
        let reader = new FileReader();
        let docType = this.props.params.docType;
        reader.onload = function (fileLoadEvent) {
            Session.set("showWait", true);
            Meteor
                .callPromise('file-upload', docType, fileName, documentId, reader.result)
                .then((response) => {
                    response.getPasswordVisible = true;
                    Session.set("showWait", false);
                    return response;
                })
                .then((response) => {
                    self.setState(response);
                })
                .catch((err) => {
                    console.log(err);
                    Session.set("showWait", false);
                });
        };
        reader.readAsBinaryString(this.state.file);
    };

    _transactionConfirmed = (password) => {
        this.setState({getPasswordVisible: false});
        Session.set("showWait", true);
        signAndSubmit(password, this.state.rawTx, true)
            .then(() => Session.set("showWait", false))
            .catch(() => Session.set("showWait", false));
    };

    _transactionCanceled = () => {
        Session.set("showWait", false);
        this.setState({getPasswordVisible: false});
    };

    render() {
        let profile = currentProfile();
        let canUpload = (this.props.params.docType == 'audit-report' && profile.role == Roles.auditor) ||
            (this.props.params.docType == 'certificate' && profile.role == Roles.certificatecreator) ||
            profile.role == Roles.administrator;
        let uploadForm = null;
        if (canUpload)
            uploadForm = <form className="md-grid" onSubmit={(e) => e.preventDefault()}>
                < TextField
                    id="fileName"
                    ref="fileName"
                    label="File Name"
                    placeholder="File Name"
                    className="md-cell md-cell--6"
                    disabled={!this.state.file}
                    value={this.state.fileName}
                    onChange={this._handleChange}
                />
                < TextField
                    id="documentId"
                    ref="documentId"
                    label="Document ID"
                    placeholder="Document ID"
                    className="md-cell md-cell--6"
                    disabled={!this.state.file}
                    value={this.state.documentId}
                    onChange={this._handleChange}
                />
                <div className="file-block md-cell md-cell--12">
                    <FileInput
                        id="report"
                        secondary
                        label="Select"
                        accept="application/pdf"
                        onChange={this._selectFile}
                    />
                    <Button style={{marginLeft: 20}}
                            id="upload"
                            secondary raised
                            label="Upload"
                            disabled={!this.state.file}
                            onClick={this._uploadFile}
                    >cloud_upload</Button>
                </div>
            </form>;

        return (
            <div>
                <GetPassword visible={this.state.getPasswordVisible}
                             cost={this.state.transactionCost}
                             balance={this.state.accountBalance}
                             confirm={this._transactionConfirmed}
                             cancel={this._transactionCanceled}
                />
                <h2>{this.props.params.docType}</h2>
                {uploadForm}
                <div className="md-grid">
                    <List className="md-cell md-cell--10 md-paper md-paper--1">
                        <Subheader primaryText="Existing Files"/>
                        {
                            Documents.find({docType: this.props.params.docType}).fetch().map((doc) => {
                                return <ListItem
                                    key={doc._id}
                                    leftAvatar={<Avatar icon={<FontIcon>insert_drive_file</FontIcon>}/>}
                                    rightIcon={<InfoIcon />}
                                    primaryText={doc.documentId}
                                    secondaryText={moment(doc.uploadTime).format('DD.MM.YYYY, HH:mm:ss')}
                                    onClick={() => {
                                        window.open('https://ipfs.infura.io/ipfs/' + doc.hash)
                                    }}
                                />
                            })
                        }
                    </List>
                </div>
            </div>
        )
    }
}