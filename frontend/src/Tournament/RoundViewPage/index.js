import React from "react";
import NavBar from "../../NavBar";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import RoundToolBar from "./RoundToolBar";
import SpoilerWrapper from "../../components/SpoilerWrapper";

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
            details: [
                {key: "Motion", value: "THW Ban Zoos."},
                {key: "Info Slide", value: "who even knows what a zoo actually is."}
            ],
            settings: [
                {key: "Silent", value: "Yes"}
            ]
        }
    }
    render() {
        return (
            <div>
                <NavBar active=""/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar/>
                        <Card>
                            <div className="display-4 text-center w-100">Round 1 - Doxbridge Worlds 2021</div>
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
                                        value={this.state.settings}
                                    >
                                        <Column field="key"/>
                                        <Column field="value"/>
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
                    </div>
                </div>
            </div>
        )
    }
}

export default RoundViewPage;