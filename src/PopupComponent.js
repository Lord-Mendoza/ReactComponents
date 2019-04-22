import React, {Component} from 'react';
import {Button, Modal} from "react-bootstrap";
import {FaCheck, FaRedo, FaTimes} from "react-icons/fa";

class PopupComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            header: "",
            content: "",
            footerConfig: "",
            show: true
        };

        this.closePopup = () => {
            const {show} = this.state;

            this.setState({show: !show})
        };
    }

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

    render() {
        const {header, content, footerConfig, show} = this.state;

        let btnOptions;
        if (footerConfig === "all") {
            btnOptions = <Modal.Footer>
                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>

                <Button variant="danger">
                    <FaRedo/> Reset
                </Button>

                <Button variant="success">
                    <FaCheck/> Submit
                </Button>
            </Modal.Footer>;

        } else if (footerConfig === "submitOnly") {
            btnOptions = <Modal.Footer>
                <Button variant="secondary" onClick={this.closePopup}>
                    <FaTimes/> Close
                </Button>

                <Button variant="success">
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

export default PopupComponent;
