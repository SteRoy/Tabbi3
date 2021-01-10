import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {SplitButton} from 'primereact/splitbutton';

class TournamentToolBar extends React.Component {
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
                <SplitButton id="teams" model={this.splitOptionsTeams} label="Teams" icon="pi pi-users" className="p-mr-2 p-button-info" />
                <SplitButton id="adjudicators" model={this.splitOptionsAdjudicators} label="Adjudicators" icon="pi pi-user" className="p-mr-2 p-button-info" />
                <SplitButton id="rounds" label="Rounds" icon="pi pi-briefcase" className="p-mr-2 p-button-help" />
                <SplitButton id="ballots" label="Ballots" icon="pi pi-file" className="p-mr-2 p-button-help" />
            </React.Fragment>
        );

        const alignRight = (
            <React.Fragment>
                <Button label="Configuration" icon="pi pi-cog" className="p-mr-2 p-button-secondary" />
            </React.Fragment>
        );

        return (
            <Toolbar className="mb-1" left={alignLeft} right={alignRight} />
        )
    }
}

export default TournamentToolBar;