import React from "react";
import { Card } from 'primereact/card';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Redirect} from "react-router-dom";
import NavBar from "../../NavBar";
import {Tag} from "primereact/tag";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Knob} from "primereact/knob";
const ttlib = require("ttlib");

class TeamListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: []
        }

        this.metrics = [
            {id: "count", title: "No. Teams", calc: (teams) => teams.length}
        ]
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/teams`,
            'GET',
            (teamsData) => {
                let teams = teamsData.teams;
                teams = teams.map(t => (
                    {
                        ...t,
                        s1name: t.Speaker1.Person.name,
                        s2name: t.Speaker2.Person.name
                    }
                ))
                this.setState({teams})
            },
            () => {}
        )
    }

    render() {
        const adjIndependent = (row) => {
            return row.independent ? <Tag value="INDEPENDENT" severity="success"/> : <Tag value="INSTITUTIONAL" severity="danger"/>
        }

        const rowBodyTemplate = (row) => {
            return {
                'bg-placeholder': row.placeholder
            }
        }

        return (
            <div>
                <NavBar active="tournaments"/>
                {this.state.selected ? <Redirect to={`/tournament/${this.props.match.params.slug}/teams/${this.state.selected.id}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug}/>
                        <Card>
                            <div className="display-4 text-center">Tournament Adjudicators</div>
                            <div className="p-grid p-justify-between">
                                {
                                    this.state.teams.length > 0 ?
                                        this.metrics.map(metric => (
                                            <div className="p-col-12 p-md-12 p-text-center" key={metric.id}>
                                                <h5 className="p-mt-3">{metric.title}</h5>
                                                <Knob
                                                    value={metric.calc(this.state.teams)}
                                                />
                                            </div>
                                        ))
                                    : ""
                                }
                            </div>
                            <hr/>
                            <DataTable
                                value={this.state.teams}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} teams" rows={10} rowsPerPageOptions={[10,20,50]}
                                selection={this.state.selected}
                                onSelectionChange={e => this.setState({selected: e.value})}
                                selectionMode="single"
                                sortField="name"
                                sortOrder={-1}
                                dataKey="id"
                                rowClassName={rowBodyTemplate}
                            >
                                <Column field="name" header="Team Name" sortable filter filterPlaceholder="Search by name" filterMatchMode="contains"/>
                                <Column field="codename" header="Codename" sortable filter filterPlaceholder="Search by codename" filterMatchMode="contains"/>
                                <Column field="s1name" header="Speaker 1" sortable filter filterPlaceholder="Search by codename" filterMatchMode="contains"/>
                                <Column field="s2name" header="Speaker 2" sortable filter filterPlaceholder="Search by codename" filterMatchMode="contains"/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default TeamListPage;