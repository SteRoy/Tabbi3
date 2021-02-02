import React from "react";
import NavBar from "../../NavBar";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import RoundToolBar from "./RoundToolBar";
import SpoilerWrapper from "../../components/SpoilerWrapper";
import {Toast} from "primereact/toast";
import Loading from "../../components/Loading";
import MotionDialog from "./MotionDialog";
const ttlib = require("ttlib");

class RoundViewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
            debates: [],
            error: null,
            showMotionDialog: false
        }

        ttlib.api.requestAPI(
            `/tournaments/${props.match.params.slug}/round/${props.match.params.rid}`,
            `GET`,
            (respData) => {
                const details = [
                    {key: "Motion", value: respData.round.motion},
                    {key: "Info Slide", value: respData.round.infoslide}
                ]

                const debates = respData.round.Debates.map(debate => {
                    let debateObj = {
                        panel: debate.AdjAllocs.map(adj => ({name: adj.Adjudicator.Person.name, chair: adj.chair})),
                        venue: debate.Venue.name
                    };
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

                this.setState({...respData, details, debates});
            },
            (err) => {
                this.setState({
                    error: err
                })
            }
        )

    }

    render() {
        const keyField = (row) => {
          return <span>{ttlib.string.toTitleCase(row.key)}</span>
        };

        const valueField = (row) => {
            if ([true, false].includes(row.value)) {
                const friendlyNames = {
                    [true]: "Yes",
                    [false]: "No"
                }
                return <span>{friendlyNames[row.value]}</span>
            } else {
                return <span>{row.value}</span>
            }
        };

        const panel = (row) => {
            const length = row.panel.length;
            const panel = row.panel.filter(adj => !adj.chair);
            const chair = row.panel.find(adj => adj.chair);
            return [chair, panel].flat().map((adj, index) => {
                return (adj.chair ?
                    <span>
                        <b>&copy; {adj.name}{index === length - 1 ? '' : ', '}</b>
                    </span>
                    :
                    <span>{adj.name}{index === length - 1 ? '' : ','}</span>)
            })
        }

        return (
            <div>
                <NavBar active=""/>
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug}/>
                        {
                            this.state.round ?
                                <Card>
                                    <MotionDialog
                                        visible={this.state.showMotionDialog}
                                        round={this.state.round}
                                        hide={() => this.setState({showMotionDialog: false})}
                                        toast={this.toast}
                                    />
                                    <div className="display-4 text-center w-100">{this.state.round.title} - {this.state.tournament.name}</div>
                                    <hr/>
                                    <RoundToolBar
                                        roundID={this.state.round.id}
                                        motionCB={() => this.setState({showMotionDialog: true})}
                                        slug={this.state.tournament.slug}
                                        toast={this.toast}
                                    />
                                    <br/>
                                    <div className="p-grid">
                                        <div className="p-col text-center">
                                            <h6>Round Details</h6>
                                            <SpoilerWrapper
                                                body={
                                                    <DataTable
                                                        value={this.state.details}
                                                        className={`p-datatable-striped ${this.state.showDetails ? '': 'blur'}`}
                                                    >
                                                        <Column field="key"/>
                                                        <Column field="value"/>
                                                    </DataTable>
                                                }
                                                cbToggle={
                                                    (value) => this.setState({showDetails: value})
                                                }
                                            />
                                        </div>
                                        <div className="p-col text-center">
                                            <h6>Round Settings</h6>
                                            <DataTable
                                                className="p-datatable-striped"
                                                value={this.state.round.RoundSettings}
                                            >
                                                <Column body={keyField}/>
                                                <Column body={valueField}/>
                                            </DataTable>
                                        </div>
                                    </div>
                                    <hr/>
                                    <h6 className="text-center">Draw</h6>
                                    <DataTable
                                        value={this.state.debates}
                                        className="p-datatable-striped"
                                    >
                                        <Column field="venue" header="Venue"/>
                                        <Column field="OG" header="OG"/>
                                        <Column field="OO" header="OO"/>
                                        <Column field="CG" header="CG"/>
                                        <Column field="CO" header="CO"/>
                                        <Column body={panel} header="Panel"/>
                                    </DataTable>
                                </Card>
                                :
                                this.state.error ?
                                    <p className="alert alert-danger display-5 text-center">
                                        {this.state.error}
                                    </p>
                                    :
                                    <Loading/>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default RoundViewPage;