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
        this.updateDraw = this.updateDraw.bind(this);
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
                        venue: debate.Venue.name,
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
                                index: adjAlloc.chair ? 0 : adjAlloc.index,
                                score: adjAlloc.Adjudicator.testScore.toString()
                            })
                        })
                    )
                    return debateObj;
                });

                console.log(adj.map(a => ({id: a.id, name: a.name})));

                this.setState({...respData, debates, adj});
            },
            (err) => {
                this.setState({
                    error: err
                })
            }
        )
    }

    updateDraw(adjUpdateObject) {
        console.log(`Adjudicator Update`);
        let curAllocs = this.state.adj;
        adjUpdateObject.forEach(update => {
            const indexOfAdjAlloc = curAllocs.findIndex(adj => adj.id === update.AdjudicatorId);
            if (update.type === "SHIFT") {
                // Adjudicator will be moved to a new, designated position.
                curAllocs[indexOfAdjAlloc].index = update.shiftTo;
                console.log(`Shifted ${curAllocs[indexOfAdjAlloc].name} to position ${update.shiftTo}`);
            } else if (update.type === "SWAP") {
            //    Capacity to directly exchange two adjudicators TODO
            } else if (update.type === "NEWROOM") {
                curAllocs[indexOfAdjAlloc].index = update.shiftTo;
                // TODO: Validate
                curAllocs[indexOfAdjAlloc].roomid = update.newRoom;
                console.log(`Migrated ${curAllocs[indexOfAdjAlloc].name} to position ${update.shiftTo} in room ${update.newRoom}`);
            }
        });

        this.setState({
            adj: curAllocs
        })
    }

    onDragEnd = (result) => {
        if (result.destination && result.reason !== "CANCEL") {
            const isNewAssignment = result.destination.droppableId !== result.source.droppableId;
            if ((isNewAssignment) || (result.destination.index !== result.source.index)) {
                const destinationAdj = this.state.adj.filter(adjAlloc => adjAlloc.roomid === result.destination.droppableId);
                const sourceAdj = this.state.adj.filter(adjAlloc => adjAlloc.roomid === result.source.droppableId);
                let adjudicatorUpdates = [];

                const destinationAdjDemoted = destinationAdj.filter(adj => adj.index >= result.destination.index && adj.id !== result.draggableId);
                const sourceAdjPromoted = sourceAdj.filter(adj => adj.index > result.source.index && adj.id !== result.draggableId);

                if (result.destination.droppableId !== result.source.droppableId) {
                    adjudicatorUpdates.push(
                        {
                            AdjudicatorId: result.draggableId,
                            type: "NEWROOM",
                            newRoom: result.destination.droppableId,
                            shiftTo: result.destination.index
                        }
                    )
                } else {
                    adjudicatorUpdates.push(
                        {
                            AdjudicatorId: result.draggableId,
                            type: "SHIFT",
                            shiftTo: result.destination.index
                        }
                    )
                }

                let alreadyHandled = [];
                let order = [];

                if (result.destination.index < result.source.index) {
                    order = [[destinationAdjDemoted, (ind) => ind + 1, (adj) => adj.index < result.source.index], [sourceAdjPromoted, (ind) => ind - 1, () => true]];
                } else {
                    order = [[sourceAdjPromoted, (ind) => ind - 1, (adj) => adj.index >= result.source.index], [destinationAdjDemoted, (ind) => ind + 1, () => true]];
                }

                if (!isNewAssignment) {
                    order = [order[0]];
                }

                order.forEach((orderObj) => {
                    orderObj[0].forEach(adjAlloc => {
                        if (!alreadyHandled.includes(adjAlloc.id)) {
                            alreadyHandled.push(adjAlloc.id);
                            if (isNewAssignment || orderObj[2](adjAlloc)) {
                                adjudicatorUpdates.push(
                                    {
                                        AdjudicatorId: adjAlloc.id,
                                        type: "SHIFT",
                                        shiftTo: orderObj[1](adjAlloc.index)
                                    }
                                )
                            }
                        }
                    })
                })

                this.updateDraw(adjudicatorUpdates);
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
                                        this.state.debates.map(debate => (
                                            <tr>
                                                <td>{debate.id} - {debate.venue}</td>
                                                <td>
                                                    <div className="p-grid" style={{margin: "0"}}>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{debate.teams.OG}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{debate.teams.CG}</div>
                                                        </div>
                                                        <div className="p-col" style={{padding: "0"}}>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{debate.teams.OO}</div>
                                                            <div style={{border: "1px solid rgb(0,0,0,.1)"}}>{debate.teams.CO}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <PanelAllocation
                                                        id={debate.id}
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