import React, {Component} from 'react';

import {Form} from 'react-bootstrap';

class FormComponent extends Component {
    constructor(props){
        super(props);

        this.state = {
            configuration: []
        };
    }

    componentDidMount() {
        const {configuration, formValues} = this.props;

        if (configuration !== undefined && formValues !== undefined){
            this.setState({configuration});
        }
    }

    render() {
        const {configuration} = this.props;

        let form;
        if (configuration !== undefined) {
            form = [];

            configuration.forEach(v => {
                form.push(<Form.Group>
                    <Form.Label> {v.name} </Form.Label>
                    <Form.Control
                        name={v.name}
                        type={v.type}
                        placeholder={v.placeholder}
                        />
                </Form.Group>);
            });
        }

        return (
            <div>
                {form}
            </div>
        );
    }
}

export default FormComponent;
