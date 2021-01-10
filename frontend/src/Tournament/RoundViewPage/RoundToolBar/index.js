import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {SplitButton} from 'primereact/splitbutton';

class RoundToolBar extends React.Component {
    constructor(props) {
        super(props);
        // Since the splitbutton menus are going to be so closely linked, we can generate them in this neat way.
        [this.splitOptionsTeams, this.splitOptionsAdjudicators] = ["teams", "adjudicators"].map(objType => {
            return ([
                {
                    label: 'Create New',
                    icon: 'pi pi-plus',
                    command: (e) => {
                        console.log(objType);
                    }
                },
                {
                    label: 'List',
                    icon: 'pi pi-align-justify',
                    command: (e) => {
                        console.log(objType);
                    }
                }
            ])
        });
    }

    render() {
        const alignLeft = (
            <React.Fragment>
                <Button label="Allocations" icon="pi pi-directions" className="p-mr-2 p-button-help" />
                <Button label="Motion" icon="pi pi-plus" className="p-mr-2 p-button-help" />
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