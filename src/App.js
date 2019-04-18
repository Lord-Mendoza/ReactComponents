import React, {Component} from 'react';
import './App.css';

import GridComponent from "./GridComponent";

const labels1 = ["First Name", "Last Name", "Age"];
const data1 = [{"First Name": "Lord", "Last Name": "Mendoza", "Age": 24},
    {"First Name": "Daniel", "Last Name": "Kim", "Age": 26},
    {"First Name": "Kiran", "Last Name": "Adepu", "Age": 28},
    {"First Name": "Nikunj", "Last Name": "Patel", "Age": 40}];

const labels2 = ["Make", "Model", "Color"];
const data2 = [{"Make": "Honda", "Model": "Civic", "Color": "Black"},
    {"Make": "Honda", "Model": "Accord", "Color": "Blue"},
    {"Make": "Toyota", "Model": "Corolla", "Color": "Silver"},
    {"Make": "Tesla", "Model": "Model S", "Color": "Silver"}];

const sampleData = (len) => {
    let retVal = [];
    for (let i = 1; i <= len; i++){
        retVal.push({"Make": "Make Sample" + i, "Model": "Model Sample" + i, "Color": "Color Sample" + i});
    }
    return retVal;
};

class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            labels: labels2,
            data: sampleData(100)
        };

        this.handleSelectedValues = this.handleSelectedValues.bind(this);
        this.handleDeletedValues = this.handleDeletedValues.bind(this);
        this.handleEditedVales = this.handleEditedVales.bind(this);
    }

    handleSelectedValues(values) {
        this.setState({selectedValues: values});
    }

    handleDeletedValues(values){
        this.setState({deletedValues: values});
    }

    handleEditedVales(values){
        this.setState({editedValues: values});
    }

    render() {
        return (
            <div>
                <GridComponent columns={this.state.labels}
                               rows={this.state.data}
                               toggleSelect={true}
                               selectedValues={this.handleSelectedValues}
                               viewConfig="all"
                               deletedValues={this.handleDeletedValues}
                               editedValues={this.handleEditedVales}
                />
            </div>
        );
    }
}

export default App;
