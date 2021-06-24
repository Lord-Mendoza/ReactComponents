/*
Lord Mendoza - 4/23/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React from 'react';
import PropTypes from "prop-types";
import loading from '../images/loading.png';
//React-Bootstrap
import {Col, Container, Image, Modal, Row} from "react-bootstrap";

//Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styling/MaskComponent.css'

//======================================================================================================================
//=================================== Constant Used for IE Compatibility ===============================================
const isIE = /*@cc_on!@*/false || !!document.documentMode;

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class MaskComponent extends React.PureComponent {
    constructor(props) {
        super(props);

        let loadingIcon = false;
        if (this.props.loadingIcon !== undefined) {
            if (this.props.loadingIcon)
                loadingIcon = this.props.loadingIcon;
        }

        let givenClassName;
        if (this.props.givenClassName !== undefined) {
            givenClassName = this.props.givenClassName;
        }

        let allowAnimation = !isIE;

        let textOnlyContent = true;
        if (this.props.hasOwnProperty("textOnlyContent") && this.props["textOnlyContent"] === false) {
            textOnlyContent = false;
        }

        let show = false;
        if (this.props.hasOwnProperty("show") && this.props["show"] === true)
            show = true;

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            header: "",
            content: "",
            show,
            loadingIcon,
            givenClassName,
            allowAnimation,
            textOnlyContent
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
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.show !== prevProps.show || this.props.content !== prevProps.content) {
            const {show, content} = this.props;
            this.setState({show, content});
        }

        if (this.props.hasOwnProperty("textOnlyContent")
            && this.props["textOnlyContent"] !== prevProps["textOnlyContent"]
            && typeof this.props["textOnlyContent"] === "boolean") {
            this.setState({
                textOnlyContent: this.props["textOnlyContent"]
            });
        }
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {header, content, show, loadingIcon, givenClassName, allowAnimation, textOnlyContent} = this.state;

        let body;
        if (loadingIcon) {
            if (textOnlyContent) {
                body = <h3 className="text-center"><Image src={loading} className={'loadingIcon'}/> {content} </h3>;
            } else {
                body = <Container>
                    <Row>
                        <Col xs={2}>
                            <Image src={loading} className={'loadingIcon'}/>
                        </Col>

                        <Col xs={10}>
                            {content}
                        </Col>
                    </Row>
                </Container>;
            }
        } else {
            body = <h3 className="text-center"> {content} </h3>;
        }

        //Rendering the modal
        return (
            <div>
                <Modal show={show} centered className={givenClassName} backdrop="static" animation={allowAnimation} backdropClassName={"maskComponentBackdrop"}>

                    <Modal.Header>
                        <Modal.Title> <b> {header} </b> </Modal.Title>
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
