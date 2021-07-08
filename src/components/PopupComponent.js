/*
Lord Mendoza - 4/23/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React from 'react';
import PropTypes from "prop-types";
//React-Bootstrap
import {Button, Modal} from "react-bootstrap";
//React-Icons
import {FaCheck, FaRedo, FaTimes} from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';

//======================================================================================================================
//=================================== Constant Used for IE Compatibility ===============================================
const isIE = /*@cc_on!@*/false || !!document.documentMode;

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class PopupComponent extends React.PureComponent {
    constructor(props) {
        super(props);

        let className;
        if (props.hasOwnProperty("className"))
            className = props["className"];

        let show = true;
        if (props.hasOwnProperty("show") && props["show"] === false)
            show = false;

        let allowAnimation = !isIE;

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            ...props,

            show,
            className,
            allowAnimation
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
    If any changes occur in the body of the modal, then the modal gets rendered accordingly.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.hasOwnProperty("show") && prevProps["show"] !== this.props["show"]) {
            this.setState({show: this.props["show"]})
        }

        if (this.props.header !== prevProps.header){
            const {header} = this.props;
            this.setState({header});
        }

        if (this.props.content !== prevProps.content){
            const {content} = this.props;
            this.setState({content});
        }

        if (this.props.hasOwnProperty("className") && prevProps["className"] !== this.props["className"]) {
            this.setState({className: this.props["className"]});
        }
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {header, content, footerConfig, show, className, allowAnimation} = this.state;
        const {hasBodyPadding} = this.props;

        //Based on the selected footerConfig, then certain buttons will get rendered in the footer of the modal.
        let btnOptions;
        if (footerConfig === "all") {
            btnOptions = <Modal.Footer>
                <Button variant="danger" onClick={this.toggleReset}>
                    <FaRedo/> Reset
                </Button>

                <Button variant="success" onClick={this.toggleSubmit}>
                    <FaCheck/> Submit
                </Button>

                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>
            </Modal.Footer>;

        } else if (footerConfig === "submit") {
            btnOptions = <Modal.Footer>
                <Button variant="success" onClick={this.toggleSubmit}>
                    <FaCheck/> Submit
                </Button>

                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
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

        let modalBodyStyle = {};
        if (!hasBodyPadding) {
            modalBodyStyle["padding"] = "0";
        }

        //Rendering the modal
        return (
            <div>
                <Modal show={show} onHide={this.closePopup} centered className={className} backdrop="static" animation={allowAnimation}>

                    <Modal.Header closeButton>
                        <Modal.Title> <b> {header} </b> </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{...modalBodyStyle}}>
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
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,

    show: PropTypes.bool,

    /**
     <b>Description:</b> The buttons to appear at the foot of the popup.
     <i>Note: providing the value of "custom" requires for customFooter to be defined.</i>
     <b>Value:</b> A string of either
     i. "custom" = giving the developer the option to define their own buttons in the footer
     ii. "closeOnly" = renders only a close button to close the popup.
     iii. "submit" = renders a close button as well as submit button.
     iv. "all" = renders a close, reset, & submit button. Ideal for forms.
     */
    footerConfig: PropTypes.string,

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

    className: PropTypes.string,
    hasBodyPadding: PropTypes.bool,
};

export default PopupComponent;