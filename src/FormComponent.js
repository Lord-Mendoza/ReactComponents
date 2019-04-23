import React, {Component} from 'react';

import {Form} from 'react-bootstrap';
import PropTypes from "prop-types";

class FormComponent extends Component {
    constructor(props) {
        super(props);

        let {configuration, formValues} = props;
        let values = {};
        if (configuration !== undefined && formValues !== undefined) {
            configuration.forEach(v => {
                if (v.type === "select")
                    values[v.name] = 'default';
                else
                    values[v.name] = '';
            });
        } else {
            configuration = [];
            values = {};
        }

        this.state = {
            configuration,
            values,
            invalidValues: []
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.submitForm !== prevProps.submitForm
            || this.props.clearForm !== prevProps.clearForm
            || this.props.markInvalid !== prevProps.markInvalid) {

            const {submitForm, clearForm, markInvalid, formValues} = this.props;
            let {values} = this.state;

            if (submitForm && formValues !== undefined) {
                formValues(values);
            } else if (clearForm) {
                Object.keys(values).forEach(v => {
                    values[v] = "";
                });
                this.setState({values});
            } else if (markInvalid !== undefined) {
                if (markInvalid.length > 0) {
                    this.setState({invalidValues: markInvalid})
                }
            }
        }
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        let updatedEntry = this.state.values;
        updatedEntry[name] = value;

        this.setState({
            values: updatedEntry
        });
    }

    render() {
        const {configuration, markInvalid} = this.props;

        let form;
        if (configuration !== undefined) {
            form = [];
            let key = 0;

            configuration.forEach(v => {
                let isInvalid = false;
                if (markInvalid !== undefined){
                    if (markInvalid.includes(v.name)) {
                        isInvalid = true;
                    }
                }

                if (v.type !== "select") {
                    form.push(<Form.Group key={key}>
                        <Form.Label> {v.name} </Form.Label>
                        <Form.Control
                            name={v.name}
                            type={v.type}
                            placeholder={v.placeholder}
                            onChange={this.handleInputChange}
                            isInvalid={isInvalid}
                            value={this.state.values[v.name]}
                        />
                    </Form.Group>);
                } else {
                    let options = [<option disabled value = {"default"} key={"default"}>Select Column...</option>];

                    v.options.forEach(o => {
                        options.push(<option value={o} key={o}> {o} </option>);
                    });

                    form.push(<Form.Group key={key}>
                        <Form.Label> {v.name} </Form.Label>
                        <Form.Control
                            as="select"
                            name={v.name}
                            onChange={this.handleInputChange}
                            isInvalid={isInvalid}
                            value={this.state.values[v.name]}>
                        {options}
                        </Form.Control>
                    </Form.Group>);
                }
                key++;
            });
        }

        return (
            <div>
                {form}
            </div>
        );
    }
}

FormComponent.propTypes = {
    /**
     <b>Description:</b> The list of form components to be generated where the label, type, placeholder and options (if applicable) are defined for each component.
     <i> Notes:
     -Placeholder is an available option only to text-based form components.
     -When using the "select" type, the options property needs to be specified to render the available options of the select box. See example for sample usage.
     </i>
     <b>Value:</b> An array of JSON objects
     [ {name: "<label for form component>", type: "<see below>", placeholder: "<text to appear as a hint>"}
        ...
     ]
     Possible types include: text, email, password, select (for combo-boxes)

     <b>Example: </b>
     [ {name: "Full Name", type: "text", placeholder: "required"},
       {name: "Date of Birth", type: "date"},
       {name: "College Year", type: "select", options: ["Freshman", "Sophomore"]}
     ]
     */
    configuration: PropTypes.array.isRequired,

    /**
     <b>Description:</b> This property uses the supplied callback function to pass the form values as typed by the user.
     <b>Value:</b> A callback function.
     */
    formValues: PropTypes.func.isRequired,

    /**
     <b>Description:</b> Toggles the FormComponent to submit the retrieved values from the user through the formValues callback function.
     <i>Note: This will not clear the form. </i>
     <b>Value:</b> Boolean
     */
    submitForm: PropTypes.bool.isRequired,

    /**
     <b>Description:</b> Toggles the FormComponent to clear the form.
     <b>Value:</b> Boolean
     */
    clearForm: PropTypes.bool.isRequired,

    /**
     <b>Description:</b> This property is used by FormComponent to filter out the components that are invalid. Once marked invalid, the form component will have a red on its surrounding, highlighting to the user where they need to revise their entry.
     <i>Note: FormComponent does not directly handle validating forms as to allow flexibility & prevent too much customized design. </i>

     <b>Value:</b> An array.
     <b>Example: </b>
     [ "Full name", "Date of birth"]
     */
    markInvalid: PropTypes.array,
};

export default FormComponent;
