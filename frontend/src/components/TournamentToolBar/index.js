import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {SplitButton} from 'primereact/splitbutton';
import {isMobile} from 'react-device-detect';

class TournamentToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: isMobile,
            slug: props.slug
        }

        this.splitOptionsTeams = null;
        this.splitOptionsAdjudicators = null;

        // Since the splitbutton menus are going to be so closely linked, we can generate them in this neat way.
        [this.splitOptionsTeams, this.splitOptionsAdjudicators] = ["teams", "adjudicators"].map(objType => {
            return ([
                {
                    label: 'Create Placeholder',
                    icon: 'pi pi-plus',
                    command: (e) => {
                        window.location.pathname = `/tournament/${this.props.slug}/create/${objType}`;
                    }
                },
                {
                    label: 'List',
                    icon: 'pi pi-align-justify',
                    command: (e) => {
                        window.location.pathname = `/tournament/${this.props.slug}/list/${objType}`;
                    }
                }
            ])
        });
    }

    render() {
        const alignLeft = (
            <React.Fragment>
                <SplitButton id="teams" model={this.splitOptionsTeams} onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/teams`} label="Teams" icon="pi pi-users" className="p-mr-2 p-button-info" />
                <SplitButton id="adjudicators" model={this.splitOptionsAdjudicators} onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/adjudicators`} label="Adjudicators" icon="pi pi-user" className="p-mr-2 p-button-info" />
                <SplitButton id="rounds" label="Rounds" icon="pi pi-briefcase" className="p-mr-2 p-button-help" />
                <SplitButton id="ballots" label="Ballots" icon="pi pi-file" className="p-mr-2 p-button-help" />
            </React.Fragment>
        );

        const alignRight = (
            <React.Fragment>
                <Button label="Configuration" icon="pi pi-cog" className="p-mr-2 p-button-secondary" />
                <Button label="Hide" icon="pi pi-window-minimize" className="p-mr-2 p-button-danger" onClick={() => this.setState({collapsed: true})}/>
            </React.Fragment>
        );

        return (
            this.state.collapsed ?
                <div className="text-center">
                    <Button label="Show Toolbar" icon="pi pi-window-maximize" className="p-mr-2 p-mb-1 p-button-success" onClick={() => this.setState({collapsed: false})}/>
                </div>
                :
                <Toolbar className="mb-1" left={alignLeft} right={alignRight} />
        )
    }
}

export default TournamentToolBar;