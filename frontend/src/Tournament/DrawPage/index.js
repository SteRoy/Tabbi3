import React from 'react';
import {InputNumber} from "primereact/inputnumber";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Chip} from "primereact/chip";
import MotionCard from "./MotionCard";
const ttlib = require("ttlib");

class DrawPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMotion: false,
            scrolling: false,
            scrollSpeed: 5,
            round: {},
            draw: []
        }

    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/round/${this.props.match.params.rid}`,
            `GET`,
            (respData) => {
                let draw = respData.round.Debates.map(debate => {
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
                draw = draw.map(room => ["OG", "OO", "CG", "CO"].map(pos => ({...room, highlight: pos}))).flat();

                this.setState({...respData, draw: draw.sort((a,b) => a[a.highlight] < b[b.highlight] ? -1 : 1)});
            },
            (err) => {
                this.setState({
                    error: err
                })
            }
        )
    }

    render() {
        const teamTemplate = (column, rowData) => {
            const key = column.header;
            return key === rowData.highlight ?
                <Chip
                    className="team-highlight text-white"
                    label={rowData[key]}
                    icon="pi pi-forward"
                />
                :
                <span>{rowData[key]}</span>;
        }

        const panelRender = (row) => {
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
                                this.state.round.infoslide ? <MotionCard
                                    header={"Info Slide"}
                                    text={this.state.round.infoslide}
                                /> : ""
                            }
                            <MotionCard
                                header={"Motion"}
                                text={this.state.round.motion}
                            />
                        </div>
                        :
                        <DataTable
                            className="p-datatable-gridlines"
                            value={this.state.draw}
                        >
                            <Column field="venue" header="Venue"/>
                            {["OG", "OO", "CG", "CO"].map(pos => (
                                <Column body={(rowData, pos) => teamTemplate(pos, rowData)} header={pos.toUpperCase()}/>
                            ))}
                            <Column body={panelRender} header="Panel"/>
                        </DataTable>
                }
            </div>
        )
    }
}

export default DrawPage;
