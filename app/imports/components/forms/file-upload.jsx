import React, {PureComponent} from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';
import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import Avatar from 'react-md/lib/Avatars';
import FontIcon from 'react-md/lib/FontIcons';
import Subheader from 'react-md/lib/Subheaders';
import {signAndSubmit} from '../../api/ethereum-services';

import {Documents} from '../../api/model/documents';

const InfoIcon = () => <FontIcon>info</FontIcon>;

export default class FileUpload extends TrackerReact(PureComponent) {
    constructor(props) {
        super(props);

        this.state = {
            file: null,
            fileName: '',
            documentId: '',
        };

        this._selectFile.bind(this);
        this._handleChange.bind(this);
        this._uploadFile.bind(this);

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
        Session.set("showWait", true);
        let fileName = this.state.fileName;
        let documentId = this.state.documentId;
        let reader = new FileReader();
        let docType = this.props.params.docType;
        reader.onload = function (fileLoadEvent) {
            Session.set("showWait", true);
            Meteor
                .callPromise('file-upload', docType, fileName, documentId, reader.result)
                .then((rawTx) => {
                    signAndSubmit(rawTx, true)
                        .then(() => Session.set("showWait", false))
                        .catch(() => Session.set("showWait", false));
                })
                .catch((err) => {
                    console.log(err);
                    Session.set("showWait", false);
                });
        };
        reader.readAsBinaryString(this.state.file);
    };

    render() {
        return (
            <div>
                <h2>{this.props.params.docType}</h2>

                <form className="md-grid">
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
                </form>
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