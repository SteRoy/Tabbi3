import React from 'react';
import {InputNumber} from "primereact/inputnumber";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Chip} from "primereact/chip";
import MotionCard from "./MotionCard";

class DrawPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMotion: false,
            infoslide: "",
            motion: "THW Ban Zoos",
            scrolling: false,
            scrollSpeed: 5,
            draw: [
                {highlight: "og", og: "Team A", oo: "Team B", cg: "Team C", co: "Team D", venue: "Room A", panel: "Matt Hazell, Jess Musulin"},
                {highlight: "oo", og: "Team A", oo: "Team B", cg: "Team C", co: "Team D", venue: "Room A", panel: "Matt Hazell, Jess Musulin"},
                {highlight: "cg", og: "Team A", oo: "Team B", cg: "Team C", co: "Team D", venue: "Room A", panel: "Matt Hazell, Jess Musulin"},
                {highlight: "co", og: "Team A", oo: "Team B", cg: "Team C", co: "Team D", venue: "Room A", panel: "Matt Hazell, Jess Musulin"}
            ].sort((a,b) => a[a.highlight] < b[b.highlight] ? -1 : 1)
        }
    }

    render() {
        const teamTemplate = (column, rowData) => {
            const key = column.header.toLowerCase();
            return key === rowData.highlight ?
                <Chip
                    className="team-highlight text-white"
                    label={rowData[key]}
                    icon="pi pi-forward"
                />
                :
                <span>{rowData[key]}</span>;
        }

        return (
            <div style={{minHeight: "90vh"}}>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="/">Tabbi3</a>
                    <button
                        className={`btn btn-outline-warning my-2 my-sm-0`}
                        onClick={() => this.setState({showMotion: !this.state.showMotion})}
                    >
                        {this.state.showMotion ? "Draw" : "Motion"}
                    </button>
                    <div className="nav-item p-mx-2 text-right">
                        <InputNumber
                            value={this.state.scrollSpeed}
                            onChange={(e) => this.setState({scrollSpeed: e.value})}
                            step={1}
                            min={1}
                            max={10}
                            showButtons={true}
                            buttonLayout={"stacked"}
                            style={{width: '50px'}}
                            inputStyle={{width: '50px'}}
                        />
                    </div>

                    <button
                        className={`nav-item btn btn-outline-${this.state.scrolling ? "danger" : "success"} p-mx-5`}
                        onClick={() => this.setState({scrolling: !this.state.scrolling})}
                    >
                        {this.state.scrolling ? "Stop" : "Start"} Scroll
                    </button>
                </nav>
                {
                    this.state.showMotion ?
                        <div className="p-grid p-justify-center">
                            {
                                this.state.infoslide ? <MotionCard
                                    header={"Info Slide"}
                                    text={this.state.infoslide}
                                /> : ""
                            }
                            <MotionCard
                                header={"Motion"}
                                text={this.state.motion}
                            />
                        </div>
                        :
                        <DataTable
                            className="p-datatable-gridlines"
                            value={this.state.draw}
                        >
                            <Column field="venue" header="Venue"/>
                            {["og", "oo", "cg", "co"].map(pos => (
                                <Column body={(rowData, pos) => teamTemplate(pos, rowData)} header={pos.toUpperCase()}/>
                            ))}
                            <Column field="panel" header="Panel"/>
                        </DataTable>
                }
            </div>
        )
    }
}

export default DrawPage;
