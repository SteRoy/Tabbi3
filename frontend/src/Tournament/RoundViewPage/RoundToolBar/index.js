import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";

class RoundToolBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const alignLeft = (
            <React.Fragment>
                <a href={`./${this.props.roundID}/allocate`}><Button label="Allocations" icon="pi pi-directions" className="p-mr-2 p-button-help" /></a>
                <Button label="Motion" icon="pi pi-plus" className="p-mr-2 p-button-help" onClick={this.props.motionCB} />
            </React.Fragment>
        );

        const alignRight = (
            <React.Fragment>
                <Button label="Round Settings" icon="pi pi-cog" className="p-mr-2 p-button-secondary" />
            </React.Fragment>
        );

        return (
            <Toolbar className="mb-1" left={alignLeft} right={alignRight} />
        )
    }
}

export default RoundToolBar;