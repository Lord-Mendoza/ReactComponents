import React, {Component} from 'react';
import './App.css';
import {Button} from 'react-bootstrap';

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

const pageSizing = [10, [10, 50, 100]];

class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            labels: labels2,
            data: sampleData(100),
            pageSizing: pageSizing
        };

        this.changeData = this.changeData.bind(this);
    }

    changeData() {
        if (this.state.change)
            this.setState({change: false, labels: labels2, data: data2});
        else
            this.setState({change: true, labels: labels1, data: data1});
    }

    render() {
        return (
            <div>
                {/*<Button variant="danger" onClick={this.changeData}>
                    Switch
                </Button>*/}

                <GridComponent columns={this.state.labels}
                               rows={this.state.data}
                               pageSizing={this.state.pageSizing}
                               toggleSelect={true}
                />
            </div>
        );
    }
}

export default App;
