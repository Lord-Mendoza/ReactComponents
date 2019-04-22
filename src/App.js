import React, {Component} from 'react';
import './App.css';

import GridComponent from "./GridComponent";

const labels2 = ["Make", "Model", "Color"];
const sampleData = (len) => {
    let retVal = [];
    for (let i = 1; i <= len; i++){
        retVal.push({"Make": "Make Sample" + i, "Model": "Model Sample" + i, "Color": "Color Sample" + i});
    }
    return retVal;
};

/*
Popup

import PopupComponent from "./PopupComponent"
import {Image, Modal} from "react-bootstrap";*/

/*import FormComponent from './FormComponent'*/

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

            /*values: "",
            configuration: [{name: "First name", type: "text", placeholder: "required"},
                            {name: "Last name", type: "email", placeholder: "required"},
                            {name: "Age", type: "date", placeholder: "required"}]*/
        };

        this.handleSelectedValues = (values) => {this.setState({selectedValues: values})};
        this.handleDeletedValues = (values) => {this.setState({deletedValues: values})};
        this.handleEditedValues = (values) => {this.setState({editedValues: values})};
        this.handleSearchValues = (values) => {this.setState({searchValues: values})};
        this.handlePageChange = (value) => {this.setState({currentPage: value})};
        this.handlePageSizeChange = (value) => {this.setState({currentPageSize: value})};
        this.handleRefresh = () => {alert("refresh triggered!")};
        this.handleCreate = () => {alert("create triggered!")};

        /*this.getFormValues = (values) => {
          this.setState({values})
        };*/
    }

    render() {
        /*const {configuration} = this.state;*/

        return (
            <div>
                <GridComponent columns={this.state.labels}
                               rows={this.state.data}

                               viewConfig="all"

                               toggleSelect={true}
                               selectedValues={this.handleSelectedValues}

                               blockedColumns={this.state.blockedColumns}
                               blockedSearchColumns={this.state.blockedSearchColumns}

                               remotePaging={true}
                               totalCount={this.state.totalDataCount}
                               currentPage={this.handlePageChange}
                               currentPageSize={this.handlePageSizeChange}

                               searchValue={this.handleSearchValues}

                               deletedValues={this.handleDeletedValues}
                               editedValues={this.handleEditedValues}
                               refreshToggled={this.handleRefresh}
                               createToggled={this.handleCreate}
                />

                {/*
                Popup

                <PopupComponent header={"Hello"}
                                content={<p> <Image src="reject.png"/> You made an invalid edit. Please try again. </p>}
                                footerConfig={"submit"}
                />*/}

                {/*<FormComponent
                        configuration={configuration}
                        formValues={this.getFormValues}
                    />*/}
            </div>
        );
    }
}

export default App;
