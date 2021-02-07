import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TeamQuadrant from "./TeamQuadrant";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Toast} from "primereact/toast";
import Loading from "../../components/Loading";
const ttlib = require("ttlib");

class BallotPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: false,
            loading: true,
            draw: {}
        }

        let requestAddress = "";

        if (props.match.params.debateid) {
        //    Tab Ballot
            requestAddress = `/tournaments/${props.match.params.slug}/ballots/debate/${props.match.params.debateid}/tab`;
            this.state.tab = true;
        } else if (props.match.params.ballotid) {
        //    Tab viewing an e-ballot
            requestAddress = `/tournaments/${props.match.params.slug}/ballots/debate/${props.match.params.debateid}/${props.match.params.ballotid}`;
            this.state.tab = true;
        } else {
        //    Submitting an e-ballot
        }

        ttlib.api.requestAPI(
            requestAddress,
            `GET`,
            (respData) => {
                let draw = {};
                ["OG", "OO", "CG", "CO"].forEach(position => {
                    const team = respData.debate.TeamAllocs.find(ta => ta.position === position);
                    draw[position] = {
                        name: team.Team.name,
                        speakers: [
                            {name: team.Team.Speaker1.Person.name},
                            {name: team.Team.Speaker2.Person.name}
                        ]
                    }
                })
                this.setState({...respData, draw, loading: false});
            },
            (err) => {
                this.setState({
                    error: err,
                    loading: false
                });
            }
        )
    }

    render() {
        return (
            <div>
                <NavBar active=""/>
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11 p-lg-9">
                        {
                            this.state.tab ? <TournamentToolBar slug={this.props.match.params.slug} /> : ""
                        }
                        {
                            this.state.error ? <div className="alert alert-danger">{this.state.error}</div> : "" }
                        }
                        {
                            !this.state.debate ?
                                <Loading/> :

                                <Card>
                                <div className="display-4 text-center w-100">{this.state.debate.Round.title} - {this.state.debate.Round.Tournament.name}</div>
                                <p className="display-5 text-center w-100">{this.state.debate.Venue.name}</p>
                                <hr/>
                                <div className="p-grid border-bottom">
                                    <div className="p-col border-right">
                                        <TeamQuadrant
                                            opening={true}
                                            position={"OG"}
                                            team={this.state.draw.OG}
                                        />
                                    </div>
                                    <div className="p-col">
                                        <TeamQuadrant
                                            opening={true}
                                            position={"OO"}
                                            team={this.state.draw.OO}
                                        />
                                    </div>
                                </div>

                                <div className="p-grid">
                                    <div className="p-col border-right">
                                        <TeamQuadrant
                                            opening={false}
                                            position={"CG"}
                                            team={this.state.draw.CG}
                                        />
                                    </div>
                                    <div className="p-col">
                                        <TeamQuadrant
                                            opening={false}
                                            position={"CO"}
                                            team={this.state.draw.CO}
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-block btn-success">Submit</button>
                            </Card>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default BallotPage;