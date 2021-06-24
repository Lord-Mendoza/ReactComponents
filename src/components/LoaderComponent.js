/*
Lord Mendoza - 8/7/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component} from 'react';
import PropTypes from "prop-types";

//Semantic-UI React
import {Card, Dimmer, Loader} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class LoaderComponent extends Component {
    constructor(props) {
        super(props);

        let inverted = true;
        if (this.props.inverted !== undefined)
            if (!this.props.inverted)
                inverted = this.props.inverted;

        let loadingMessage = "Loading...";
        if (this.props.loadingMessage !== undefined && typeof this.props.loadingMessage === 'string')
            loadingMessage = this.props.loadingMessage;

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            content: "",
            isLoading: true,
            inverted,
            loadingMessage
        };
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    componentDidMount() {
        const {content, isLoading} = this.props;

        if (content !== undefined && isLoading !== undefined) {
            this.setState({content, isLoading});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.content !== prevProps.content || this.props.isLoading !== prevProps.isLoading) {
            const {content, isLoading} = this.props;
            this.setState({content, isLoading});
        }
    }

    //=========================================== RENDER ===============================================================

    render() {
        const {isLoading, loadingMessage, content, inverted} = this.state;

        let loader;
        if (inverted)
            loader = <Dimmer active={isLoading} inverted>
                <Loader content={loadingMessage}/>
            </Dimmer>;
        else
            loader = <Dimmer active={isLoading}>
                <Loader content={loadingMessage}/>
            </Dimmer>;

        //Rendering the loader
        return (
            <div>
                <Card fluid={true}>
                    {loader}
                    {content}
                </Card>
            </div>
        );
    }
}

//=========================================== DOCUMENTATIONS ===========================================================
LoaderComponent.propTypes = {

    /**
     <b>Description:</b> Whether to overlay the content or not.
     <b>Value:</b> A boolean.
     */
    isLoading: PropTypes.bool.isRequired,

    /**
     <b>Description:</b> The content to be overlayed.
     <b>Value:</b> An object.
     */
    content: PropTypes.object.isRequired,

    /**
     <b>Description:</b> The message to appear in the overlay.
     <b>Value:</b> A string.
     <b>Default:</b> "Loading..."
     */
    loadingMessage: function(props, propName){
        if (props[propName] !== undefined)
            if (typeof props[propName] !== 'string')
                return new Error ('loadingMessage requires a string as value.')
    },

    /**
     <b>Description:</b> Whether the background for the overlay is white or black. When inverted = false, overlay is white.
     <b>Value:</b> A boolean.
     <b>Default:</b> true
     */
    inverted: function(props, propName) {
        if (props[propName] !== undefined)
            if (typeof props[propName] !== 'boolean')
                return new Error ('inverted requires a boolean as value.')
    }
};

export default LoaderComponent;
