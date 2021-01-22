import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Chip} from "primereact/chip";
import {Redirect} from "react-router-dom";
const ttlib = require("ttlib");

class TournamentListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tournaments: []
        }
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments`,
            'GET',
            (tournaments) => {
                console.log(tournaments);
                this.setState({tournaments})
            },
            () => {}
        )
    }

    render() {

        const tournamentLogoBody = (tournament) => {
            return <img alt={tournament.name} src={tournament.logo} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} className="datatable-tournament-logo" />;
        }

        const teamBody = (row, team) => {
            return row.TournamentRoles.filter(r => r.role === team).map(TournamentRole => (
                <Chip label={TournamentRole.Account.Person.name} className="p-mr-1 p-mt-1"/>
            ))
        }

        return (
            <div>
                <NavBar active="tournaments"/>
                {this.state.selected ? <Redirect to={`/tournament/${this.state.selected.slug}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <Card>
                            <div className="display-4 text-center">All Tournaments</div>
                            <hr/>
                            <DataTable
                                value={this.state.tournaments}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tournaments" rows={10} rowsPerPageOptions={[10,20,50]}
                                selection={this.state.selected}
                                onSelectionChange={e => this.setState({selected: e.value})}
                                selectionMode="single"
                                dataKey="id"
                            >
                                <Column field="name" header="Tournament Name"/>
                                <Column body={(row) => teamBody(row, "tab")} header="Tab Team"/>
                                <Column body={(row) => teamBody(row, "adjcore")} header="Adj Core"/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default TournamentListPage;