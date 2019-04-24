import React, {Component} from 'react';
import './App.css';

import MaskComponent from "./MaskComponent";

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <MaskComponent header={"Please Wait"}
                               content={"Loading..."}
                               show={true}
                               loadingIcon={true}/>
            </div>
        );
    }
}

export default App;
