import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TeamQuadrant from "./TeamQuadrant";

class BallotPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            draw: {
                og: {name: "Team A", speakers: [{name: "Speaker A"}, {name: "Speaker B"}]},
                oo: {name: "Team B", speakers: [{name: "Speaker C"}, {name: "Speaker D"}]},
                cg: {name: "Team C", speakers: [{name: "Speaker E"}, {name: "Speaker F"}]},
                co: {name: "Team D", speakers: [{name: "Speaker G"}, {name: "Speaker H"}]}
            }
        }
    }

    render() {
        return (
            <div>
                <NavBar active=""/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11 p-lg-9">
                        <Card>
                            <div className="display-4 text-center w-100">Round 1 - Doxbridge Worlds 2021</div>
                            <p className="display-5 text-center w-100">Room A</p>
                            <hr/>
                            <div className="p-grid border-bottom">
                                <div className="p-col border-right">
                                    <TeamQuadrant
                                        opening={true}
                                        position={"OG"}
                                        team={this.state.draw.og}
                                    />
                                </div>
                                <div className="p-col">
                                    <TeamQuadrant
                                        opening={true}
                                        position={"OO"}
                                        team={this.state.draw.oo}
                                    />
                                </div>
                            </div>

                            <div className="p-grid">
                                <div className="p-col border-right">
                                    <TeamQuadrant
                                        opening={false}
                                        position={"CG"}
                                        team={this.state.draw.cg}
                                    />
                                </div>
                                <div className="p-col">
                                    <TeamQuadrant
                                        opening={false}
                                        position={"CO"}
                                        team={this.state.draw.co}
                                    />
                                </div>
                            </div>
                            <button className="btn btn-block btn-success">Submit</button>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}

export default BallotPage;