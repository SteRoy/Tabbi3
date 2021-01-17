import React from 'react';
import {InputNumber} from "primereact/inputnumber";

class DrawPage extends React.Component {
    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="/">Tabbi3</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"/>
                    </button>

                    <button className="btn btn-outline-warning my-2 my-sm-0">Motion</button>
                    <div className="nav-item p-mx-2 text-right">
                        <InputNumber
                            value={5}
                            step={1}
                            min={1}
                            max={10}
                            showButtons={true}
                            buttonLayout={"stacked"}
                            style={{width: '50px'}}
                            inputStyle={{width: '50px'}}
                        />
                    </div>

                    <button className="nav-item btn btn-outline-success p-mx-5">Start Scroll</button>
                </nav>
            </div>
        )
    }
}

export default DrawPage;
