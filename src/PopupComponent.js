/*
Lord Mendoza - 4/23/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component} from 'react';
import PropTypes from "prop-types";

//React-Bootstrap
import {Button, Modal} from "react-bootstrap";

//React-Icons
import {FaCheck, FaRedo, FaTimes} from "react-icons/fa";

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class PopupComponent extends Component {
    constructor(props) {
        super(props);

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            header: "",
            content: "",
            footerConfig: "",
            show: true
        };

        //Helper functions for handling interactions with the modal (such as submit, reset, & closing)
        this.closePopup = () => {
            const {show} = this.state;
            this.props.closeToggled(true);

            this.setState({show: !show})
        };
        this.toggleReset = () => {
            if (this.props.resetToggled !== undefined)
                this.props.resetToggled(true);
        };
        this.toggleSubmit = () => {
            if (this.props.submitToggled !== undefined)
                this.props.submitToggled(true);
        }
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    /*
    This initializes the modal & ensures that if the "custom" footer config is set, then the corresponding
    customFooter props is also defined.
     */
    componentDidMount() {
        const {header, content, footerConfig, customFooter} = this.props;

        if (header !== undefined && content !== undefined && footerConfig !== undefined) {
            if (this.state.footerConfig === "custom" && this.state.customFooter !== undefined)
                this.setState({
                    header, content, footerConfig, customFooter
                });
            else if (this.state.footerConfig !== "custom")
                this.setState({
                    header, content, footerConfig
                });
        }
    }

    /*
    If any changes occur in the body of the modal, then the modal gets rendered accordingly.
     */
    componentDidUpdate(prevProps) {
        if (this.props.content !== prevProps.content){
            const {content} = this.props;
            this.setState({content});
        }
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {header, content, footerConfig, show} = this.state;

        //Based on the selected footerConfig, then certain buttons will get rendered in the footer of the modal.
        let btnOptions;
        if (footerConfig === "all") {
            btnOptions = <Modal.Footer>
                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>

                <Button variant="danger" onClick={this.toggleReset}>
                    <FaRedo/> Reset
                </Button>

                <Button variant="success" onClick={this.toggleSubmit}>
                    <FaCheck/> Submit
                </Button>
            </Modal.Footer>;

        } else if (footerConfig === "submit") {
            btnOptions = <Modal.Footer>
                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>

                <Button variant="success" onClick={this.toggleSubmit}>
                    <FaCheck/> Submit
                </Button>
            </Modal.Footer>;
        } else if (footerConfig === "closeOnly") {
            btnOptions = <Modal.Footer>
                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>
            </Modal.Footer>;

        } else if (footerConfig === "custom") {
            btnOptions = this.props.customFooter;
        }

        //Rendering the modal
        return (
            <div>
                <Modal show={show} onHide={this.closePopup} centered>

                    <Modal.Header closeButton>
                        <Modal.Title> {header} </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {content}
                    </Modal.Body>

                    {btnOptions}
                </Modal>
            </div>
        );
    }
}

//=========================================== DOCUMENTATIONS ===========================================================
PopupComponent.propTypes = {

    /**
     <b>Description:</b> The title of the popup.
     <b>Value:</b> A string.
     */
    header: PropTypes.string.isRequired,

    /**
     <b>Description:</b> The content of the popup. PopupComponent offers flexibility on the content, such as placing another component (ex. FormComponent) inside.
     <b>Value:</b> An object.
     */
    content: PropTypes.object.isRequired,

    /**
     <b>Description:</b> The buttons to appear at the foot of the popup.
     <i>Note: providing the value of "custom" requires for customFooter to be defined.</i>
     <b>Value:</b> A string of either
     i. "custom" = giving the developer the option to define their own buttons in the footer
     ii. "closeOnly" = renders only a close button to close the popup.
     iii. "submit" = renders a close button as well as submit button.
     iv. "all" = renders a close, reset, & submit button. Ideal for forms.
     */
    footerConfig: PropTypes.string.isRequired,

    /**
     <b> Description: </b> A callback function to call in the parent component when the popup is closed.
     <b> Value: </> A callback function.
     */
    closeToggled: PropTypes.func.isRequired,

    /**
     <b>Description:</b> The custom footer buttons as defined by the developer.
     <b>Value:</b> An object encapsulated with the "Modal.Footer" tag from React-Bootstrap
     <b>Source:</b> https://react-bootstrap.github.io/components/modal/
     */
    customFooter: function(props, propName) {
        if (props['footerConfig'] === 'custom' && props[propName] === undefined){
            return new Error(
                'Setting footerConfig prop to "custom" requires for customFooter to be defined.'
            );
        }
        else if (props['footerConfig'] === 'custom' && (typeof props[propName] !== 'object')){
            return new Error(
                'customFooter requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> When "footerConfig" is set to "all", this must be included to respond to the user's desire to reset what's placed in the content body.
     <b>Value:</b> A callback function.
     */
    resetToggled: function(props, propName) {
        if (props['footerConfig'] === 'all' && props[propName] === undefined){
            return new Error(
                'Setting footerConfig prop to "all" requires for resetToggled to be defined.'
            );
        }
        else if (props['footerConfig'] === 'all' && (typeof props[propName] !== 'function')){
            return new Error(
                'resetToggled requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> When "footerConfig" is set to "all" or "submit", this must be included to respond to the user's desire to submit what's placed in the content body.
     <b>Value:</b> A callback function.
     */
    submitToggled: function(props, propName) {
        if ( (props['footerConfig'] === 'all' || props['footerConfig'] === 'submit') && props[propName] === undefined){
            return new Error(
                'Setting footerConfig prop to "all" or "submit" requires for submitToggled to be defined.'
            );
        }
        else if ((props['footerConfig'] === 'all' || props['footerConfig'] === 'submit') && (typeof props[propName] !== 'function')){
            return new Error(
                'submitToggled requires a function as value.'
            );
        }
    },
};

export default PopupComponent;
