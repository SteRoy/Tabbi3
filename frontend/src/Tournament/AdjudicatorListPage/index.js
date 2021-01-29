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

class AdjudicatorListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adjudicators: []
        }

        this.metrics = [
            {id: "testScore", title: "Avg. Test Score", calc: (adj) => ttlib.array.average(adj.map(x => x.testScore))},
            {id: "count", title: "No. Adjudicators", calc: (adj) => adj.length}
        ]
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/adjudicators`,
            'GET',
            (adjudicatorsData) => {
                let adjudicators = adjudicatorsData.adjudicators;
                adjudicators = adjudicators.map(adj => (
                    {
                        ...adj,
                        name: adj.Person.name
                    }
                ))
                this.setState({adjudicators})
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
                {this.state.selected ? <Redirect to={`/tournament/${this.props.match.params.slug}/adjudicators/${this.state.selected.id}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug}/>
                        <Card>
                            <div className="display-4 text-center">Tournament Adjudicators</div>
                            <div className="p-grid p-justify-between">
                                {
                                    this.state.adjudicators.length > 0 ?
                                        this.metrics.map(metric => (
                                            <div className="p-col-12 p-md-6 p-text-center" key={metric.id}>
                                                <h5 className="p-mt-3">{metric.title}</h5>
                                                <Knob
                                                    value={metric.calc(this.state.adjudicators)}
                                                />
                                            </div>
                                        ))
                                    : ""
                                }
                            </div>
                            <hr/>
                            <DataTable
                                value={this.state.adjudicators}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} adjudicators" rows={10} rowsPerPageOptions={[10,20,50]}
                                selection={this.state.selected}
                                onSelectionChange={e => this.setState({selected: e.value})}
                                selectionMode="single"
                                sortField="name"
                                sortOrder={-1}
                                dataKey="id"
                                rowClassName={rowBodyTemplate}
                            >
                                <Column field="name" header="Adjudicator Name" sortable filter filterPlaceholder="Search by name" filterMatchMode="contains"/>
                                <Column field="testScore" header="Test Score" sortable/>
                                <Column body={adjIndependent} header="Independent Adjudicator" sortable/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default AdjudicatorListPage;