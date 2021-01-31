import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import { DragDropContext } from 'react-beautiful-dnd';
import PanelAllocation from "./components/PanelAllocation";
import socketIOClient from "socket.io-client";
import {Button} from "primereact/button";
import {Toast} from "primereact/toast";
const ttlib = require("ttlib");


class AllocationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            debates: [],
            adj: []
        }

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    componentWillUnmount() {
        if (this.state.socket) {
            this.state.socket.disconnect();
        }
    }

    componentDidMount() {
        if (!this.state.socket) {
            const socket = socketIOClient();

            socket.on("toast", (title, subtitle) => {
                this.toast.show({
                    severity: 'error',
                    summary: title,
                    detail: subtitle,
                    life: 10000
                })
            })

            socket.on("connect", () => {
                this.setState({
                    connected: true
                })
            });

            socket.on("disconnect", () => {
                this.setState({
                    connected: false
                })
            });

            this.setState({socket})
        }
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/round/${this.props.match.params.rid}`,
            `GET`,
            (respData) => {
                let adj = [];
                const debates = respData.round.Debates.map(debate => {
                    let debateObj = {
                        'teams': {},
                        id: debate.id.toString()
                    };
                    ["OG", "OO", "CG", "CO"].forEach(pos => {
                        let dta = debate.TeamAllocs.find(dta => dta.position === pos);
                        if (dta) {
                            dta = dta.Team.name;
                        } else {
                            dta = "Not Set"
                        }
                        debateObj['teams'][pos] = dta;
                    });
                    let index = 0;
                    adj = adj.concat(
                        debate.AdjAllocs.map(adjAlloc => {
                            if (!adjAlloc.chair) {
                                index++;
                            }

                            return({
                                roomid: adjAlloc.DebateId.toString(),
                                id: adjAlloc.id.toString(),
                                name: adjAlloc.Adjudicator.Person.name,
                                index: adjAlloc.chair ? 0 : index,
                                score: adjAlloc.Adjudicator.testScore.toString()
                            })
                        })
                    )
                    return debateObj;
                });


                this.setState({...respData, debates, adj});
            },
            (err) => {
                this.setState({
                    error: err
                })
            }
        )
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
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        { this.state.error ? <div className="alert alert-danger">{this.state.error}</div> : "" }
                        <Card>
                            <div className="display-4 text-center w-100">Allocations - Round 1 - Doxbridge Worlds 2021</div>
                            <div className="text-center mt-2">
                                <span className="mr-2">Legend</span>
                                <span className="clash-legend clashed-institution-current mr-2">Cur. Institutional Clash</span>
                                <span className="clash-legend clashed-institution-previous mr-2">Prev. Institutional Clash</span>
                                <span className="clash-legend clashed-personal mr-2">Personal Clash</span>
                                <span className="clash-legend clashed-soft mr-2">Soft Clash</span>
                            </div>
                            <div className="text-left">
                                {
                                    this.state.connected ?
                                        <Button className="p-button-outlined p-button-success" label="Connected"/>
                                        :
                                        <Button className="p-button-outlined p-button-danger" label="Disconnected"/>
                                }
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
                                        this.state.debates.map(room => (
                                            <tr>
                                                <td>{room.id}</td>
                                                <td>
                                                    <div className="p-grid" style={{margin: "0"}}>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.OG}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.CG}</div>
                                                        </div>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.OO}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{room.teams.CO}</div>
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