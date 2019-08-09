/*
Lord Mendoza - 8/8/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component, useCallback} from 'react';
import PropTypes from "prop-types";
//React-Dropzone
import {useDropzone} from 'react-dropzone';
import {Button, Container, Icon, Image} from "semantic-ui-react";
//Styling
import './FileUploadComponent.css';

//======================================================================================================================
//====================================== HELPER FUNCTION FOR UPLOAD ====================================================

function FileUpload(props) {
    const onDrop = useCallback(acceptedFiles => {
        props.listOfFiles(acceptedFiles);

        // eslint-disable-next-line
    }, []);

    const {getRootProps, getInputProps} = useDropzone({onDrop, accept: props.fileType});

    if (props.uploadByBtn)
        return (<div {...getRootProps({className: 'ui tiny icon right labeled button'})}>
                <Icon name='upload'/>
                {props.fileUploadText}
                <input {...getInputProps()}/>
            </div>
        );
    else
        return (
            <section className="container">
                <div {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <Image src={"./upload.png"}/>
                    <h4>{props.fileUploadText}</h4>
                </div>
            </section>
        );
}

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class FileUploadComponent extends Component {
    constructor(props, context) {
        super(props, context);

        let fileType = "";
        if (this.props.fileType !== undefined)
            if (typeof this.props.fileType === 'string')
                fileType = this.props.fileType;

        let resetUponSubmit = true;
        if (this.props.resetUponSubmit !== undefined)
            if (typeof this.props.resetUponSubmit === "boolean")
                resetUponSubmit = this.props.resetUponSubmit;

        let uploadByBtn = false;
        if (this.props.uploadByBtn !== undefined)
            if (typeof this.props.uploadByBtn === "boolean")
                uploadByBtn = this.props.uploadByBtn;

        let fileUploadText = "Drag and drop some files here, or click to select files";
        if (this.props.fileUploadText !== undefined) {
            if (typeof this.props.fileUploadText === "string") {
                fileUploadText = this.props.fileUploadText;
            }
        } else if (uploadByBtn === true) {
            fileUploadText = "Upload";
        }

        let showFileUploadManager = true;
        if (this.props.showFileUploadManager !== undefined)
            if (typeof this.props.showFileUploadManager === "boolean")
                showFileUploadManager = this.props.showFileUploadManager;

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            files: [],
            fileType,
            resetUponSubmit,
            fileUploadText,
            uploadByBtn,
            showFileUploadManager
        };

        //------The functions for this class------
        this.getListOfFiles = this.getListOfFiles.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.resetFiles = this.resetFiles.bind(this);
        this.submitFiles = this.submitFiles.bind(this);
    }

    //==================================================================================================================
    //======================================== HELPER FUNCTIONS ========================================================

    /*
    Retrieving the list of files to be displayed underneath the file drop component.
     */
    getListOfFiles(files) {
        const {showFileUploadManager} = this.state;

        if (!showFileUploadManager) {
            if (files !== [])
                this.props.files(files);
        } else
            this.setState({files});
    }

    /*
    Whenever the trash icon is selected for a particular file after uploading, it will get removed from the upload queue.
     */
    removeFile(file) {
        let {files} = this.state;

        files.splice(files.indexOf(file), 1);
        this.setState({files});
    }

    /*
    Removing all the files from the upload queue.
     */
    resetFiles() {
        this.setState({files: []});
    }

    /*
    Does the actual file upload.
     */
    submitFiles() {
        let {files, resetUponSubmit} = this.state;

        if (files !== [])
            this.props.files(files);

        if (resetUponSubmit)
            this.setState({files: []});
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {files, fileType, fileUploadText, uploadByBtn, showFileUploadManager} = this.state;

        /*
        Displaying the list of files that the user uploaded underneath the file drop component. It will display a trash
        icon on the left of them to allow for removal from the upload queue.
         */
        let listOfFiles = files.map(file => (
            <li key={file.path}>
                <Button basic icon onClick={() => this.removeFile(file)}> <Icon name='trash'/> </Button> {file.path}
            </li>
        ));

        /*
        Displaying the list of files prepared above, as well as showing the reset and submit buttons for handling the
        upload queue.
         */
        let filesToBeUploaded;
        if (showFileUploadManager) {
            if (listOfFiles.length > 0) {
                filesToBeUploaded = <div style={{padding: "30px 10px 5px 0px"}}>
                    <Button icon labelPosition='right' size='tiny' onClick={this.resetFiles}>
                        <Icon name='repeat'/> Reset </Button>

                    <Button icon labelPosition='right' size='tiny' onClick={this.submitFiles}>
                        <Icon name='send'/> Submit </Button>

                    <h4 style={{marginTop: "10px", marginBottom: "10px"}}> Files to be uploaded: </h4>
                    <ul style={{
                        listStyleType: "none",
                        overflowY: "scroll",
                        maxHeight: "250px",
                        paddingRight: "50px"
                    }}>{listOfFiles}</ul>
                </div>;
            }
        }

        if (uploadByBtn) {
            return (
                <div>
                    <FileUpload listOfFiles={this.getListOfFiles}
                                fileType={fileType}
                                fileUploadText={fileUploadText}
                                uploadByBtn={uploadByBtn}/>
                    {filesToBeUploaded}
                </div>
            );
        } else {
            return (
                <div>
                    <Container>
                        <FileUpload listOfFiles={this.getListOfFiles}
                                    fileType={fileType}
                                    fileUploadText={fileUploadText}
                                    uploadByBtn={uploadByBtn}/>
                        {filesToBeUploaded}
                    </Container>
                </div>
            );
        }
    }
}

//=========================================== DOCUMENTATIONS ===========================================================
FileUploadComponent.propTypes = {

    /**
     <b>Description:</b> Uses the callback function to return the list of files.
     <b>Value:</b> A callback function.
     */
    files: PropTypes.func.isRequired,

    /**
     <b>Description:</b> Determines the file type that the file uploader will accept.
     <b>Value:</b> A string that specifies a file type.

     The value must be a comma-separated list of unique content type specifiers:
     -A file extension starting with the STOP character (U+002E). (e.g. .jpg, .png, .doc).
     -A valid MIME type with no extensions.
     -audio/\* representing sound files.
     -video/\* representing video files.
     -image/\* representing image files.
     <b>Default:</b> "" (which will accept any file type).
     */
    fileType: function (props, propName) {
        if (props[propName] !== undefined)
            if (typeof props[propName] !== "string")
                return new Error('fileType requires a string as a value.')
    },

    /**
     <b>Description:</b> Determines whether to reset the list of files uploaded upon clicking "submit". Only applies when showUploadManager is set to true.
     <b>Value:</b> A boolean
     <b>Default:</b> true
     */
    resetUponSubmit: function (props, propName) {
        if (props[propName] !== undefined)
            if (typeof props[propName] !== 'boolean')
                return new Error('resetUponSubmit requires a boolean as value.');
            if (props["showFileUploadManager"] !== undefined)
                if (props["showFileUploadManager"] === false)
                    return new Error('resetUponSubmit only applies when showFileUploadManager is set to true.');
    },

    /**
     <b>Description:</b> The label of the upload field/button.
     <b>Value:</b> A string
     <b>Default:</b>
        -If uploadByBtn is set to true, the default fileUploadText is "Upload"
        -Otherwise, it's "Drag and drop some files here, or click to select files"
     */
    fileUploadText: function (props, propName) {
        if (props[propName] !== undefined)
            if (typeof props[propName] !== 'string')
                return new Error('fileUploadText requires a string as value.')
    },

    /**
     <b>Description:</b> Specifying whether to render a button, or an upload field.
     <b>Value:</b> A boolean
     <b>Default:</b> false
     */
    uploadByBtn: function (props, propName) {
        if (props[propName] !== undefined)
            if (typeof props[propName] !== 'boolean')
                return new Error('uploadByBtn requires a boolean as value.')
    },

    /**
     <b>Description:</b> Specifying whether to show the files uploaded queue to the user, and allow them to reset, delete, and submit them.
     <b>Value:</b> A boolean
     <b>Default:</b> true
     */
    showFileUploadManager: function (props, propName) {
    if (props[propName] !== undefined)
        if (typeof props[propName] !== 'boolean')
            return new Error('showFileUploadManager requires a boolean as value.')
    }
};

export default FileUploadComponent;
