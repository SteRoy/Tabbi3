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
            adj: [],
            clashMap: null,
            clashes: {},
            clashLoaded: false,
            expanded: {},
        }


        this.onDragEnd = this.onDragEnd.bind(this);
        this.updateDraw = this.updateDraw.bind(this);
        this.calculateClashes = this.calculateClashes.bind(this);
        this.expandRow = this.expandRow.bind(this);
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
                                    dta = {name: dta.Team.name, id: dta.Team.id};
                                } else {
                                    dta = {name: "Not Set", id: -1}
                                }
                                debateObj['teams'][pos] = dta;
                            });
                            let index = 0;
                            adj = adj.concat(
                                debate.AdjAllocs.map(adjAlloc => {
                                    if (!adjAlloc.chair) {
                                        index++;
                                    }

                                    return ({
                                        roomid: adjAlloc.DebateId.toString(),
                                        id: adjAlloc.id.toString(),
                                        adjId: adjAlloc.AdjudicatorId,
                                        name: adjAlloc.Adjudicator.Person.name,
                                        index: adjAlloc.chair ? 0 : adjAlloc.index,
                                        score: adjAlloc.Adjudicator.testScore.toString()
                                    })
                                })
                            )
                            return debateObj;
                        });
                        this.setState({...respData, debates, adj});
                        ttlib.api.requestAPI(
                            `/tournaments/${this.props.match.params.slug}/adjudicators/clash`,
                            "GET",
                            (respData) => {
                                if (respData.adjudicatorClashMappings) {
                                    this.setState({
                                        clashMap: respData.adjudicatorClashMappings,
                                        clashLoaded: true
                                    }, () => {
                                        this.calculateClashes();
                                    });
                                }
                                ttlib.component.toastSuccess(this.toast, `Clash Map Loaded`, "Clash has been loaded into the allocation and will now appear accordingly.");
                            },
                            (err) => {
                                console.log(err);
                                ttlib.component.toastError(this.toast, `Clash Map Loading Failed`, err);
                            }
                        );
                    },
                    (err) => {
                        this.setState({
                            error: err
                        })
                    }
                )
                socket.emit("join_allocation", `${this.props.match.params.slug}`, `${this.props.match.params.rid}`);
                this.toast.clear();
                this.setState({
                    connected: true
                })
            });

            socket.on("new_adj_update", (adjUpdate) => {
                this.updateDraw(adjUpdate);
            })

            socket.on("error", (errorMessage) => {
                this.toast.show({severity: "error", detail: errorMessage, summary: "Error", sticky: true});
            })

            socket.on("disconnect", () => {
                this.toast.show({
                    severity: "error",
                    detail: "Server Disconnected",
                    summary: "Your browser has disconnected from the server. Any updates you make may not make it to the server. Try refreshing/check your internet connection.",
                    sticky: true
                });
                this.setState({
                    connected: false
                })
            });

            this.setState({socket})
        }
    }

    updateDraw(adjUpdateObject) {
        let curAllocs = this.state.adj;
        let toasts = [];
        let needClashUpdate = [];
        adjUpdateObject.forEach(update => {
            const indexOfAdjAlloc = curAllocs.findIndex(adj => adj.adjId === update.AdjudicatorId);
            const adjAlloc = curAllocs[indexOfAdjAlloc];
            if (update.type === "SHIFT") {
                // Adjudicator will be moved to a new, designated position.
                adjAlloc.index = update.shiftTo;
                toasts.push({severity:'info', summary: `${adjAlloc.name}`, detail: `Shifted to position ${update.shiftTo}`, life: 2000});
            } else if (update.type === "SWAP") {
            //    Capacity to directly exchange two adjudicators TODO
            } else if (update.type === "NEWROOM") {
                adjAlloc.index = update.shiftTo;
                // TODO: Validate
                toasts.push({severity:'success', summary: `${adjAlloc.name}`, detail: `Moved from Room ID: ${adjAlloc.roomid} to Room ID: ${update.shiftTo}`, life: 2000});
                adjAlloc.roomid = update.newRoom;
            }

            [adjAlloc.roomid, update.newRoom].forEach(debateId => {
                if (debateId && !needClashUpdate.includes(debateId)) {
                    needClashUpdate.push(debateId);
                }
            })
        });

        this.adjUpdates.show(toasts);

        this.setState({
            adj: curAllocs
        }, () => {
            this.calculateClashes(needClashUpdate);
        });
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
                            AdjudicatorId: this.state.adj.find(adjAlloc => adjAlloc.id === result.draggableId).adjId,
                            type: "NEWROOM",
                            newRoom: result.destination.droppableId,
                            shiftTo: result.destination.index
                        }
                    )
                } else {
                    adjudicatorUpdates.push(
                        {
                            AdjudicatorId: this.state.adj.find(adjAlloc => adjAlloc.id === result.draggableId).adjId,
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
                                        AdjudicatorId: adjAlloc.adjId,
                                        type: "SHIFT",
                                        shiftTo: orderObj[1](adjAlloc.index)
                                    }
                                )
                            }
                        }
                    })
                })

                if (this.state.socket) {
                    this.state.socket.emit(
                        "adjudicator_update",
                        this.props.match.params.slug,
                        this.props.match.params.rid,
                        adjudicatorUpdates
                    )
                    this.updateDraw(adjudicatorUpdates);
                }
            }
        }
    };

    calculateClashes(updateSubset) {
        const updateDebateClashObj = (curVal, newVal) => {
            if (!curVal) {
                return newVal;
            }

            if (curVal !== "institutional") {
                if (newVal === "hard") {
                    return newVal;
                } else if (curVal === "hard") {
                    return curVal;
                } else {
                    return newVal === "institutional" ? curVal : newVal;
                }
            } else {
                return newVal;
            }
        }

        let clashes = this.state.clashes;
        let clashMap = this.state.clashMap;
        if (!this.state.clashLoaded) {
            clashMap = {}
        }
        this.state.debates
            .filter(deb => {
                if (updateSubset) {
                    return updateSubset.includes(deb.id);
                } else {
                    return true;
                }
            })
            .forEach(debate => {
            let debateClashObj = {
                teams: {},
                adjudicators: {},
                messages: []
            }
            const teams = Object.keys(debate.teams).map(position => ({id: debate.teams[position].id, position: position, name: debate.teams[position].name}));
            const adjudicatorsInDebate = this.state.adj.filter(adj => adj.roomid === debate.id);
            adjudicatorsInDebate.forEach(adj => {
                const adjClash = clashMap[adj.adjId];
                if (adjClash) {
                    teams.forEach(teamObj => {
                        const teamInDebate = adjClash.teams[teamObj.id];
                        if (teamInDebate) {
                            debateClashObj.teams[teamObj.position] = updateDebateClashObj(debateClashObj.teams[teamObj.position], teamInDebate);
                            debateClashObj.adjudicators[adj.adjId] = updateDebateClashObj(debateClashObj.adjudicators[adj.adjId], teamInDebate);
                            debateClashObj.messages.push(`${debate.venue}: ${adj.name} is ${teamInDebate.toUpperCase()} clashed from ${teamObj.name}`);
                        }
                    });

                    adjudicatorsInDebate.forEach(adjComparison => {
                        const adjInDebate = adjClash.adjudicators[adjComparison.adjId];
                        if (adjInDebate) {
                            debateClashObj.adjudicators[adj.adjId] = updateDebateClashObj(debateClashObj.adjudicators[adj.adjId], adjInDebate);
                            debateClashObj.adjudicators[adjComparison.adjId] = updateDebateClashObj(debateClashObj.adjudicators[adjComparison.adjId], adjInDebate);
                            debateClashObj.messages.push(`${debate.venue}: ${adj.name} is ${adjInDebate.toUpperCase()} clashed from ${adjComparison.name}`);
                        }
                    })
                }
            })

            clashes[debate.id] = debateClashObj;
        });

        this.setState({clashes});
    }

    expandRow(rowId) {
        let currentExpand = this.state.expanded;
        currentExpand[rowId] = !currentExpand[rowId];
        this.setState({
            expanded: currentExpand
        });
    }

    render() {
        const clashToClass = {
            'hard': 'clashed-personal',
            'soft': 'clashed-soft',
            'institutional': 'clashed-institution-current'
        }

        return (
            <div>
                <NavBar active=""/>
                <Toast ref={(ref) => this.toast = ref}/>
                <Toast ref={(ref) => this.adjUpdates = ref} position="bottom-left"/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        { this.state.error ? <div className="alert alert-danger">{this.state.error}</div> : "" }
                        {
                            this.state.tournament ?
                                <Card>
                                <div className="display-4 text-center w-100">Allocations - {this.state.round.title} - {this.state.tournament.name}</div>
                                <div className="text-center mt-2">
                                    <span className="mr-2">Legend</span>
                                    <span className="clash-legend clashed-institution-current mr-2">Cur. Institutional Clash</span>
                                    <span className="clash-legend clashed-institution-previous mr-2">Prev. Institutional Clash</span>
                                    <span className="clash-legend clashed-personal mr-2">Personal Clash</span>
                                    <span className="clash-legend clashed-soft mr-2">Soft Clash</span>
                                </div>
                                <div className="text-center mt-1">
                                    {
                                        this.state.connected ?
                                            <Button className="p-button-outlined p-button-success p-mr-1" label="Connected"/>
                                            :
                                            <Button className="p-button-outlined p-button-danger p-mr-1" label="Disconnected"/>
                                    }

                                    {
                                        this.state.clashLoaded ?
                                            <Button className="p-button-outlined p-button-success" label="Clash Loaded"/>
                                            :
                                            <Button className="p-button-outlined p-button-danger" label="Clash Not Loaded"/>
                                    }
                                </div>
                                <hr/>
                                <DragDropContext onDragEnd={this.onDragEnd}>
                                    <table className="table text-center" style={{tableLayout: "fixed"}}>
                                        <thead>
                                        <tr>
                                            <th style={{width: "5%"}}/>
                                            <th style={{width: "10%"}}>#</th>
                                            <th style={{width: "20%"}}>Teams</th>
                                            <th style={{width: "65%"}}>Panel</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.debates.map(debate => (
                                                <React.Fragment>
                                                    <tr key={`tr-${debate.id}`}>
                                                        <td>
                                                            <Button
                                                                className={`p-button-outlined p-button-secondary`}
                                                                onClick={() => this.expandRow(debate.id)}
                                                                icon={`pi pi-fw pi-chevron-${this.state.expanded[debate.id] ? "down" : "right"}`}
                                                            />
                                                        </td>
                                                        <td>{debate.id} - {debate.venue}</td>
                                                        <td>
                                                            <div className="p-grid" style={{margin: "0"}}>
                                                                <div className="p-col" style={{padding: "0"}}>
                                                                    {
                                                                        ["OG", "CG"].map(position => {
                                                                            const clashes = this.state.clashes[debate.id];
                                                                            let clashClass = "";
                                                                            if (clashes) {
                                                                                clashClass = clashes.teams[position];
                                                                            }
                                                                            return (
                                                                                <div
                                                                                    style={{border: "1px solid rgb(0,0,0,.1)"}}
                                                                                    className={clashToClass[clashClass]}
                                                                                >
                                                                                    {debate.teams[position].name}
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                                <div className="p-col" style={{padding: "0"}}>
                                                                    {
                                                                        ["OO", "CO"].map(position => {
                                                                            const clashes = this.state.clashes[debate.id];
                                                                            let clashClass = "";
                                                                            if (clashes) {
                                                                                clashClass = clashes.teams[position];
                                                                            }
                                                                            return (
                                                                                <div
                                                                                    style={{border: "1px solid rgb(0,0,0,.1)"}}
                                                                                    className={clashToClass[clashClass]}
                                                                                >
                                                                                    {debate.teams[position].name}
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <PanelAllocation
                                                                id={debate.id}
                                                                adj={this.state.adj}
                                                                clashes={this.state.clashes[debate.id]}
                                                            />
                                                        </td>
                                                    </tr>
                                                    {
                                                        this.state.expanded[debate.id] ?
                                                            <tr key={`tr-expanded-${debate.id}`}>
                                                                <td></td>
                                                                <td></td>
                                                                <td>Debate has {this.state.clashes[debate.id].messages.length} problems.</td>
                                                                <td>
                                                                    {
                                                                        this.state.clashes[debate.id].messages ?
                                                                            this.state.clashes[debate.id].messages.map(
                                                                                (message, index) => <p>{index + 1}. {message}</p>
                                                                            )
                                                                            : "No Problems."
                                                                    }
                                                                </td>
                                                            </tr>
                                                            : ""
                                                    }
                                                </React.Fragment>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                </DragDropContext>
                            </Card>
                                : ""
                        }
                    </div>
                </div>
            </div>
            )
        }
}

export default AllocationPage;