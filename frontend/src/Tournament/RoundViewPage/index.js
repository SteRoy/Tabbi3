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
const ttlib = require("ttlib");

class RoundViewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
            draw: [
                {
                    room: "Room 1",
                    og: "Team A",
                    oo: "Team B",
                    cg: "Team C",
                    co: "Team D",
                    panel: "Matt Hazell"
                }
            ],
            error: null
        }

        ttlib.api.requestAPI(
            `/tournaments/${props.match.params.slug}/round/${props.match.params.rid}`,
            `GET`,
            (respData) => {
                const details = [
                    {key: "Motion", value: respData.round.motion},
                    {key: "Info Slide", value: respData.round.infoslide}
                ]
                this.setState({...respData, details});
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
                                <div className="display-4 text-center w-100">{this.state.round.title} - {this.state.tournament.name}</div>
                                <hr/>
                                <RoundToolBar
                                    roundID={1}
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
                                    value={this.state.draw}
                                    className="p-datatable-striped"
                                >
                                    <Column field="room" header="Room"/>
                                    <Column field="og" header="OG"/>
                                    <Column field="oo" header="OO"/>
                                    <Column field="cg" header="CG"/>
                                    <Column field="co" header="CO"/>
                                    <Column field="panel" header="Panel"/>
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