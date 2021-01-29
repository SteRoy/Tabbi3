import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import { DragDropContext } from 'react-beautiful-dnd';
import PanelAllocation from "./components/PanelAllocation";


class AllocationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: [
                {
                    id: "0",
                    teams: {
                        og: "Team A",
                        oo: "Team B",
                        cg: "Team C",
                        co: "Team D"
                    }
                },
                {
                    id: "1",
                    teams: {
                        og: "Team E",
                        oo: "Team F",
                        cg: "Team G",
                        co: "Team H"
                    }
                }
            ],
            adj: [
                {roomid: "0", id: "0", name: "Judge 1", score: "10.0", index: 0},
                {roomid: "1", id: "1", name: "Judge 2", score: "10.0", index: 0},
                {roomid: "0", id: "2", name: "Judge 3", score: "10.0", index: 1},
                {roomid: "0", id: "3", name: "Judge 4", score: "10.0", index: 2},
            ]
        }

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd = (result) => {
        if (result.destination) {
            if (result.destination.droppableId !== result.source.droppableId) {
                // Get all adjudicators in new room
                let adjInNewRoom = this.state.adj.filter(a => a.roomid === result.destination.droppableId);

                // Get all adjudicators in old room
                let adjInOldRoom = this.state.adj.filter(a => a.roomid === result.source.droppableId && a.id !== result.draggableId);

                // Determine new index for each of those adj
                // In old room, -- to index for each judge with index > sourceIndex
                adjInOldRoom = adjInOldRoom.map(adj => adj.index > result.source.index ? {index: adj.index - 1, id: adj.id} : {index: adj.index, id: adj.id});
                // In new room, ++ to index for each judge with index >= destinationIndex
                adjInNewRoom = adjInNewRoom.map(adj => adj.index >= result.destination.index ? {index: adj.index + 1, id: adj.id} : {index: adj.index, id: adj.id});

                // Single source of truth for adjudicators who require an update is
                const adjIDNeedingUpdate = adjInOldRoom.map(adj => adj.id).concat(adjInNewRoom.map(adj => adj.id)).concat([result.draggableId]);
                const adjUpdates = adjInOldRoom.concat(adjInNewRoom).concat([{id: result.draggableId, index: result.destination.index, roomid: result.destination.droppableId}]);

                // TODO: Investigate a better storage method that allows the parallelism of this to not be such a huge pain in the ass
                this.setState(prevState => ({
                    adj: prevState.adj.map(
                        adjAlloc =>
                            adjIDNeedingUpdate.includes(adjAlloc.id) ?
                                {...adjAlloc, ...adjUpdates.find(update => update.id === adjAlloc.id)}
                                :
                                {...adjAlloc}
                    )
                }));
            }
        }
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
                                <table className="table text-center" style={{tableLayout: "fixed"}}>
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
                                                    <div className="p-grid" style={{margin: "0"}}>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.og}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.cg}</div>
                                                        </div>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.oo}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.co}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <PanelAllocation
                                                        id={room.id}
                                                        adj={this.state.adj}
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