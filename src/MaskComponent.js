/*
Lord Mendoza - 4/23/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component} from 'react';
import PropTypes from "prop-types";
import './MaskComponent.css'

//React-Bootstrap
import {Image, Modal} from "react-bootstrap";

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class MaskComponent extends Component {
    constructor(props) {
        super(props);

        let loadingIcon = false;
        if (this.props.loadingIcon !== undefined) {
            if (this.props.loadingIcon)
                loadingIcon = this.props.loadingIcon;
        }

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            header: "",
            content: "",
            show: true,
            loadingIcon
        };
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    /*
    This initializes the modal for its header & content setup.
     */
    componentDidMount() {
        const {header, content, show} = this.props;

        if (header !== undefined && content !== undefined && show !== undefined) {
            this.setState({
                header, content
            });
        }
    }

    /*
    If the loading mask is set to hide, then this will respond to those changes accordingly.
     */
    componentDidUpdate(prevProps) {
        if (this.props.show !== prevProps.show) {
            const {show} = this.props;
            this.setState({show});
        }
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {header, content, show, loadingIcon} = this.state;

        let body;
        if (loadingIcon) {
            body = <h4 className="text-center"><Image className="App-logo" src="loading.png"/> {content} </h4>;
        } else {
            body = <h4 className="text-center"> {content} </h4>;
        }

        //Rendering the modal
        return (
            <div>
                <Modal show={show} centered>

                    <Modal.Header>
                        <Modal.Title> {header} </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {body}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

//=========================================== DOCUMENTATIONS ===========================================================
MaskComponent.propTypes = {

    /**
     <b>Description:</b> The title of the popup.
     <b>Value:</b> A string.
     */
    header: PropTypes.string.isRequired,

    /**
     <b>Description:</b> The message to appear in the mask popup.
     <b>Value:</b> A string.
     */
    content: PropTypes.string.isRequired,

    /**
     <b>Description:</b> Toggles whether to show the mask or not
     <i> Note: It's ideal to assign a parent's state property here to toggle when to show a mask or not (which is ideal when performing a background process) </i>
     <b>Value:</b> Boolean
     */
    show: PropTypes.bool.isRequired,

    /**
     <b>Description:</b> Toggles whether to show a rotating loading icon in the content.
     <b>Value:</b> Boolean
     */
    loadingIcon: PropTypes.bool,
};

export default MaskComponent;
