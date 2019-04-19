import React, {Component} from 'react';
import './App.css';

import GridComponent from "./GridComponent";

/*const labels1 = ["First Name", "Last Name", "Age"];
const data1 = [{"First Name": "Lord", "Last Name": "Mendoza", "Age": 24},
    {"First Name": "Daniel", "Last Name": "Kim", "Age": 26},
    {"First Name": "Kiran", "Last Name": "Adepu", "Age": 28},
    {"First Name": "Nikunj", "Last Name": "Patel", "Age": 40}];*/

const labels2 = ["Make", "Model", "Color"];
/*
const data2 = [{"Make": "Honda", "Model": "Civic", "Color": "Black"},
    {"Make": "Honda", "Model": "Accord", "Color": "Blue"},
    {"Make": "Toyota", "Model": "Corolla", "Color": "Silver"},
    {"Make": "Tesla", "Model": "Model S", "Color": "Silver"}];
*/

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
            data: sampleData(100),
            blockedColumns: ["Color"],
            blockedSearchColumns: ["Color"],
            currentPage: 0,
            currentPageSize: 10,
            totalDataCount: 100
        };

        this.handleSelectedValues = (values) => {this.setState({selectedValues: values})};
        this.handleDeletedValues = (values) => {this.setState({deletedValues: values})};
        this.handleEditedVales = (values) => {this.setState({editedValues: values})};
        this.handleSearchValues = (values) => {this.setState({searchValues: values})};
        this.handlePageChange = (value) => {this.setState({currentPage: value})};
        this.handlePageSizeChange = (value) => {this.setState({currentPageSize: value})};
        this.handleRefresh = () => {alert("refresh triggered!")};
        this.handleCreate = () => {alert("create triggered!")};
    }

    render() {
        return (
            <div>
                <GridComponent columns={this.state.labels}
                               rows={this.state.data}

                               toggleSelect={true}
                               selectedValues={this.handleSelectedValues}

                               viewConfig="all"

                               blockedColumns={this.state.blockedColumns}
                               blockedSearchColumns={this.state.blockedSearchColumns}

                               remotePaging={false}
                               totalCount={this.state.totalDataCount}
                               currentPage={this.handlePageChange}
                               currentPageSize={this.handlePageSizeChange}

                               searchValue={this.handleSearchValues}

                               deletedValues={this.handleDeletedValues}
                               editedValues={this.handleEditedVales}
                               refreshToggled={this.handleRefresh}
                               createToggled={this.handleCreate}
                />
            </div>
        );
    }
}

export default App;
