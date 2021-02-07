import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import Loading from "../../components/Loading";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import TournamentToolBar from "../../components/TournamentToolBar";
import {InputText} from "primereact/inputtext";
import {ContextMenu} from "primereact/contextmenu";
import { Redirect } from "react-router-dom";
const ttlib = require("ttlib");

class BallotListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            globalFilter: "",
            selectedDebate: null,
            cmSelected: null,
            loading: true
        }

        ttlib.api.requestAPI(
            `/tournaments/${props.match.params.slug}/ballots/round/${props.match.params.rid}`,
            `GET`,
            (respData) => {
                const debates = respData.round.Debates.map(debate => {
                    let debateObj = {
                        id: debate.id,
                        venue: debate.Venue.name,
                        ballots: debate.Ballots
                    };

                    const chair = debate.AdjAllocs.find(adj => adj.chair);

                    if (chair) {
                        debateObj.chair = chair.Adjudicator.Person.name;
                    }

                    ["OG", "OO", "CG", "CO"].forEach(pos => {
                        let teamalloc = debate.TeamAllocs.find(dta => dta.position === pos);
                        if (teamalloc) {
                            teamalloc = teamalloc.Team.name;
                        } else {
                            teamalloc = "Not Set"
                        }
                        debateObj[pos] = teamalloc;
                    });

                    return debateObj;
                });

                this.setState({...respData, debates, loading: false});
            },
            (err) => {
                this.setState({
                    error: err
                })
            }
        );

        this.contextMenu = [
            {
                label: 'E-Ballots',
                icon: 'pi pi-fw pi-wifi'
            },

            {
                label: 'Tab Ballot',
                icon: 'pi pi-fw pi-file',
                items: [
                    {
                        label: 'View/Edit',
                        icon: 'pi pi-fw pi-pencil'
                    },
                    {
                        label: 'Mark Finalised',
                        icon: 'pi pi-fw pi-check-circle'
                    }
                ]
            }
        ];
    }

    render() {
        const debateFinalised = (debate) => {
            return debate.ballots.some(b => b.finalised) ? <span className="pi pi-check text-success"/> : <span className="pi pi-times text-danger"/>;
        }

        return (
            <div>
                <NavBar active=""/>
                <ContextMenu model={this.contextMenu} ref={(ref) => this.cm = ref} onHide={() => this.setState({cmSelected: null})}/>
                {
                    this.state.selectedDebate ? <Redirect to={`/tournament/${this.props.match.params.slug}/ballots/${this.state.selectedDebate.id}/create`} /> : "" }
                }
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11 p-lg-9">
                        <TournamentToolBar
                            slug={this.props.match.params.slug}
                        />
                        {
                            !this.state.tournament ? <Loading/> :
                            <Card>
                                <div className="display-4 text-center w-100">{this.state.round.title} - {this.state.tournament.name}</div>
                                <p className="display-5 text-center w-100">Ballots</p>
                                <div className="w-100 text-center">
                                    <small>The <b>finalised</b> ballot represents the final, true result of a given debate.
                                        There should only ever be one finalised ballot for a given debate - at this point the debate is finalised and no more e-ballots will be permitted.
                                        Left clicking on a debate in the table below will open the Tab-entered ballot for a debate.
                                    </small>
                                </div>
                                <hr/>
                                {
                                    this.state.debates.length > 0 ?
                                        <span>
                                            <InputText
                                                type="text"
                                                value={this.state.globalFilter}
                                                className="w-100 p-inputtext-lg p-d-block p-mb-1"
                                                onInput={(e) => this.setState({globalFilter: e.target.value})}
                                                placeholder="Filter debates by team name, chair name, or room name"
                                            />
                                            <DataTable
                                                value={this.state.debates}
                                                globalFilter={this.state.globalFilter}
                                                contextMenuSelection={this.state.cmSelected}
                                                onContextMenuSelectionChange={e => this.setState({cmSelected: e.value})}
                                                onContextMenu={e => this.cm.show(e.originalEvent)}
                                                selection={this.state.selectedDebate}
                                                onSelectionChange={e => this.setState({selectedDebate: e.value})}
                                                selectionMode="single"
                                                dataKey="id"
                                                paginator
                                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} debates" rows={10} rowsPerPageOptions={[10,20,50]}
                                            >
                                                <Column field="venue" header="Room"/>
                                                <Column field="OG" header="OG"/>
                                                <Column field="OO" header="OO"/>
                                                <Column field="CG" header="CG"/>
                                                <Column field="CO" header="CO"/>
                                                <Column field="chair" header="Chair"/>
                                                <Column body={debateFinalised} header="Finalised"/>
                                                <Column body={debateFinalised} header="E-Ballot"/>
                                                <Column body={debateFinalised} header="Tab Ballot"/>
                                            </DataTable>
                                            <small>Right click on a debate to view options.</small>
                                        </span>
                                        :
                                        <div className="alert alert-danger">There are no debates for this round yet! Create them before you enter ballots.</div>
                                }
                            </Card>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default BallotListPage;