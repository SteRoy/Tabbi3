import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PanelAllocation from "./components/PanelAllocation";


class AllocationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: [
                {
                    id: 0,
                    teams: {
                        og: "Team A",
                        oo: "Team B",
                        cg: "Team C",
                        co: "Team D"
                    },
                    panel: [
                        {id: 0, name: "Matt Hazell", score: "10.0"}
                    ]
                },

                {
                    id: 1,
                    teams: {
                        og: "Team E",
                        oo: "Team F",
                        cg: "Team G",
                        co: "Team H"
                    },
                    panel: [
                        {id: 1, name: "Jess Musulin", score: "6.9"}
                    ]
                }
            ]
        }

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd = () => {
    };

    render() {
        return (
            <div>
                <NavBar active=""/>
                    <div className="p-grid p-justify-center p-align-center p-mt-5">
                        <div className="p-col-11">
                            <Card>
                            <div className="display-4 text-center w-100">Allocations - Round 1 - Doxbridge Worlds 2021</div>
                            <div className="text-center mt-2">
                                <span className="mr-2">Legend</span>
                                <span className="clash-legend clashed-institution-current mr-2">Cur. Institutional Clash</span>
                                <span className="clash-legend clashed-institution-previous mr-2">Prev. Institutional Clash</span>
                                <span className="clash-legend clashed-personal mr-2">Personal Clash</span>
                                <span className="clash-legend clashed-soft mr-2">Soft Clash</span>
                            </div>
                            <hr/>
                            <DragDropContext onDragEnd={this.onDragEnd}>
                                <table className="table text-center" style={{tableLayout: "auto"}}>
                                    <thead>
                                        <tr>
                                            <th style={{width: "10%"}}>#</th>
                                            <th style={{width: "20%"}}>Teams</th>
                                            <th style={{width: "70%"}}>Panel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.rooms.map(room => (
                                            <tr>
                                                <td>{room.id}</td>
                                                <td>
                                                    <div className="p-grid">
                                                        <div className="p-col" style={{paddingTop: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.og}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.cg}</div>
                                                        </div>
                                                        <div className="p-col" style={{paddingTop: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.oo}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.co}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <PanelAllocation
                                                        panel={room.panel}
                                                        id={room.id}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                </table>
                            </DragDropContext>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}

export default AllocationPage;