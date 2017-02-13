import React, {PureComponent} from 'react';
import FileInput from 'react-md/lib/FileInputs';
import Button from 'react-md/lib/Buttons';
import TextField from 'react-md/lib/TextFields';

export default class FileUpload extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            file: null,
            fileName: '',
            visible: false,
            progress: 0,
        };

        this._interval = null;

        this._selectFile.bind(this);
        this._handleChange.bind(this);
        this._uploadFile.bind(this);
    }

    _selectFile = (file) => {
        if (!file) {
            return;
        }
        this.setState({file, fileName: file.name});
    };

    _handleChange = (value) => {
        this.setState({fileName: value});
    };

    _uploadFile = () => {
        let fileName = this.state.fileName;
        let reader = new FileReader();
        reader.onload = function (fileLoadEvent) {
            Meteor.call('file-upload', fileName, reader.result);
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
            </div>
        )
    }
}