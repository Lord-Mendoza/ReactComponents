import React, {Component} from 'react';
import './App.css';

//1st
// import GridComponent from "./GridComponent";

//2nd
// import FormComponent from "./FormComponent";
// import PopupComponent from "./PopupComponent";
// import {Image} from "react-bootstrap";

//3rd
// import LoaderComponent from "./LoaderComponent";
// import GridComponent from "./GridComponent";

//4th
import FileUploadComponent from "./FileUploadComponent";

class App extends Component {
    constructor(props, context){
        super(props, context);

        this.state = {
            showPopup: false,
            resetForm: false,
            submitForm: false
        };

        this.getFormValues = this.getFormValues.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.getUploadedFiles = this.getUploadedFiles.bind(this);
    }

    getFormValues(values) {
        for (let prop in values){
            if (values.hasOwnProperty(prop)){
                console.log(values[prop])
            }
        }
    }

    closePopup(value){
        if (value === true){
            this.setState({showPopup: false});
        }
    }

    resetForm(value){
        if (value === true){
            this.setState({submitForm: false, resetForm: true});
        } else {
            this.setState({resetForm: false});
        }
    }

    submitForm(value){
        if (value === true){
            this.setState({submitForm: true, resetForm: false});
        } else {
            this.setState({submitForm: false});
        }
    }

    getUploadedFiles(files){
        console.log(files);
    }

    render() {
        // let popup;
        // if (this.state.showPopup) {
        //     popup = <PopupComponent header={"Warning"}
        //                             content={<b> You've crossed the line! </b>}
        //                             footerConfig={"closeOnly"}
        //                             closeToggled={this.closePopup}/>;
        //
        //     // popup = <PopupComponent header={"Registration Form"}
        //     //                         content={<FormComponent  configuration={[
        //     //                                                     {name: "Full Name", type: "text", placeholder: "required"},
        //     //                                                     {name: "Date of Birth", type: "date"},
        //     //                                                     {name: "College Year", type: "select", options: ["Freshman", "Sophomore"]}
        //     //                                                 ]}
        //     //                                                 formValues={this.getFormValues}
        //     //                                                 submitForm={this.state.submitForm}
        //     //                                                 clearForm={this.state.resetForm}
        //     //                                                 />}
        //     //                         footerConfig={"all"}
        //     //                         resetToggled={this.resetForm}
        //     //                         submitToggled={this.submitForm}
        //     //                         closeToggled={this.closePopup}
        //     // />;
        // }

        return (
            <div>
                {/*<GridComponent columns={["Name", "Age"]} rows={[{Name: "Sarah", Age: 24}, {Name: "John", Age: 35}]}/>*/}

                {/* Show off the submitForm, markInvalid, and clearForm in that order. */}
                {/*<FormComponent configuration={[
                                    {name: "Full Name", type: "text", placeholder: "required"},
                                    {name: "Date of Birth", type: "date"},
                                    {name: "College Year", type: "select", options: ["Freshman", "Sophomore"]}
                                ]}
                               formValues={this.getFormValues}
                               submitForm={false}
                               clearForm={false}

                               markInvalid={""}/>*/}

                {/* Show off the most basic popup, then show the form component inside popup*/}
                {/*{popup}*/}

                 {/*Show off what happens when isLoading changes; also show loadingMessage & inverted*/}
                {/*<LoaderComponent isLoading={true}
                                 content ={<div>
                                     <GridComponent columns={["Name", "Age"]} rows={[{Name: "Sarah", Age: 24}, {Name: "John", Age: 35}]}/>
                                 </div>}
                />*/}

                <FileUploadComponent files={this.getUploadedFiles}
                                     uploadByBtn={true}/>
            </div>
        );
    }
}

export default App;
