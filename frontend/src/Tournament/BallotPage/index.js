import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TeamQuadrant from "./TeamQuadrant";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Toast} from "primereact/toast";
import Loading from "../../components/Loading";
import {Redirect} from 'react-router-dom';
import {Button} from "primereact/button";
const ttlib = require("ttlib");

class BallotPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: false,
            loading: true,
            draw: {}
        }

        let requestAddress = '';

        if (props.match.params.ballotid) {
            //    Tab viewing an e-ballot
            requestAddress = `/ballots/${props.match.params.slug}/debate/${props.match.params.debateid}/${props.match.params.ballotid}`;
            this.state.tab = true;
        } else if (!props.eBallot) {
            //    Tab Ballot
            requestAddress = `/ballots/${props.match.params.slug}/debate/${props.match.params.debateid}/tab`;
            this.state.tab = true;
        } else {
            requestAddress = `/ballots/${props.match.params.slug}/debate/${props.match.params.debateid}/adjudicator`;
        }

        ttlib.api.requestAPI(
            requestAddress,
            `GET`,
            (respData) => {
                let draw = {};

                let ballot = null;
                if (respData.debate.Ballots) {
                    if (respData.debate.Ballots.length > 0) {
                        ballot = respData.debate.Ballots[0];
                    }
                }

                ["OG", "OO", "CG", "CO"].forEach(position => {
                    const team = respData.debate.TeamAllocs.find(ta => ta.position === position);
                    let teamResult;
                    if (ballot) {
                        teamResult = ballot.TeamResults.find(tr => tr.TeamId === team.TeamId);
                    }
                    draw[position] = {
                        id: team.Team.id,
                        name: team.Team.name,
                        points: teamResult ? 4 - teamResult.ranking : 0,
                        ranking: teamResult ? teamResult.ranking : "TIE",
                        speakers: [
                            {name: team.Team.Speaker1.Person.name, id: 1, speakerPoints: teamResult ? teamResult.speakerOneSpeaks : null},
                            {name: team.Team.Speaker2.Person.name, id: 2, speakerPoints: teamResult ? teamResult.speakerTwoSpeaks : null}
                        ]
                    }
                })

                this.setState({...respData, draw, loading: false, ballot});

                if (ballot) {
                    this.calculateTeamRankings(draw);
                }
            },
            (err) => {
                this.setState({
                    error: err,
                    loading: false
                });
            }
        )

        this.processInputUpdate = this.processInputUpdate.bind(this);
        this.calculateTeamRankings = this.calculateTeamRankings.bind(this);
        this.submit = this.submit.bind(this);
        this.toggleFinalised = this.toggleFinalised.bind(this);
    }

    processInputUpdate(position, speaker, dictionary) {
        let currentDraw = this.state.draw;
        Object.keys(dictionary).forEach(key => {
            if (speaker) {
                currentDraw[position].speakers.forEach(s => {
                    if (s.id === speaker) {
                        s[key] = dictionary[key];
                        if (key === "speakerPoints") {
                            if (dictionary[key] < 50) {
                                s.error = "Minimum: 50."
                            } else if (!Number.isInteger(dictionary[key])) {
                                s.error = "Whole marks only."
                            } else {
                                s.error = null;
                            }
                        }
                    }
                });
            } else {
                currentDraw[position][key] = dictionary[key];
            }
        });

        const doesSpeakerHaveHighestSpeaks = (team, speakerID) => {
            const ironSpeaker = team.speakers.find(s => s.id === speakerID);
            const nonIronSpeaker = team.speakers.find(s => s.id !== speakerID);

            if (ironSpeaker.speakerPoints < nonIronSpeaker.speakerPoints) {
                return "Ironspeaker may not be lower ranked speaker.";
            } else {
                return null;
            }
        }

        if (currentDraw[position].abnormality && currentDraw[position].abnormality !== "replacedBySwing") {
            const speakerID = currentDraw[position].abnormality === "speakerOneSpokeTwice" ? 1 : 2;
            currentDraw[position].error = doesSpeakerHaveHighestSpeaks(currentDraw[position], speakerID);
        }

        this.setState({
            draw: currentDraw
        });

        if (speaker) {
            this.calculateTeamRankings(currentDraw);
        }
    }

    calculateTeamRankings(draw) {
        let rankedTeams = Object.keys(draw).map(position => {
            return {position, points: 0, speakerPoints: draw[position].speakers[0].speakerPoints + draw[position].speakers[1].speakerPoints}
        }).sort((a, b) => a.speakerPoints <= b.speakerPoints? 1 : -1);

        let previousRanking = 0;
        let previousPoints = 4;
        let previousTie = false;
        for (let i = 0; i < rankedTeams.length; i++) {
            previousRanking++;
            previousPoints--;
            if ((i + 1) < rankedTeams.length ? rankedTeams[i].speakerPoints === rankedTeams[i + 1].speakerPoints : false) {
                rankedTeams[i].points = null;
                rankedTeams[i].ranking = "TIE";
                rankedTeams[i].error = "Teams may not tie on speaker points.";
                previousTie = true;
                this.processInputUpdate(rankedTeams[i].position, null, {error: "Ties are not permitted."});
            } else if (previousTie) {
                rankedTeams[i].points = null;
                rankedTeams[i].ranking = "TIE";
                rankedTeams[i].error = "Teams may not tie on speaker points.";
                previousTie = false;
                this.processInputUpdate(rankedTeams[i].position, null, {error: "Ties are not permitted."});
            } else {
                rankedTeams[i].points = previousPoints;
                rankedTeams[i].ranking = previousRanking;
                this.processInputUpdate(rankedTeams[i].position, null, {error: null});
            }
        }

        let currentDraw = this.state.draw;
        rankedTeams.forEach(teamRankObj => {
            ["points", "ranking"].forEach(key => {
                currentDraw[teamRankObj.position][key] = teamRankObj[key];
            })
        })

        this.setState({
            draw: currentDraw
        })
    }

    submit() {
        this.calculateTeamRankings(this.state.draw);

        let hasError = false;
        Object.keys(this.state.draw).forEach(position => {
            if (this.state.draw[position].error) {
                hasError = true;
            } else {
                this.state.draw[position].speakers.forEach(s => {
                    if (s.error) {
                        hasError = true;
                    } else {
                        if (s.speakerPoints < 50 || s.speakerPoints > 100) {
                            s.error = "Speaks must be in range 50-100";
                            hasError = true;
                        }
                    }
                })
            }
        });

        if (!hasError) {
            const teamResults = Object.keys(this.state.draw).map(position => {
                const teamObj = this.state.draw[position];
                return ({
                    speakerOneSpeaks: teamObj.speakers[0].speakerPoints,
                    speakerTwoSpeaks: teamObj.speakers[1].speakerPoints,
                    TeamId: teamObj.id,
                    abnormality: teamObj.abnormality
                })
            });

            const ballot = {
                TeamResults: teamResults,
                enteredByTab: this.state.tab,
                DebateId: this.props.match.params.debateid
            }

            ttlib.api.requestAPI(
                `/ballots/${this.props.match.params.slug}/debate/${this.props.match.params.debateid}/${this.state.tab ? 'tab' : 'adjudicator'}`,
                `POST`,
                (respData) => {
                    ttlib.component.toastSuccess(this.toast, `Ballot Created`, "Your ballot was created successfully.");
                    this.setState({redirect: true});
                },
                (err) => {
                    ttlib.component.toastError(this.toast, `Ballot Failed`, err);
                },
                {ballot}
            );
        }
    }

    toggleFinalised() {
        if (this.state.ballot) {
            ttlib.api.requestAPI(
                `/ballots/${this.props.match.params.slug}/debate/${this.props.match.params.debateid}/ballot/${this.state.ballot.id}/finalise`,
                `POST`,
                (respData) => {
                    ttlib.component.toastSuccess(this.toast, respData.success, "Ballot finalisation status updated successfully.");
                    this.setState({redirect: true});
                },
                (err) => {
                    ttlib.component.toastError(this.toast, `Ballot Update Failed`, err);
                },
                {}
            );
        }
    }

    render() {
        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11 p-lg-9">
                        {
                            this.state.tab ?
                                <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/> : ""
                        }
                        {
                            this.state.tab ?
                                this.state.redirect ? <Redirect to={`/tournament/${this.props.match.params.slug}/ballots/${this.state.debate.Round.id}`}/>
                                    : ""
                                : ""
                        }
                        {
                            this.state.error ? <div className="alert alert-danger">{this.state.error}</div> : ""
                        }
                        {
                            !this.state.debate ?
                                <Loading/> :
                                <Card>
                                <div className="display-4 text-center w-100">{this.state.debate.Round.title} - {this.state.debate.Round.Tournament.name}</div>
                                <p className="display-5 text-center w-100">
                                    {this.state.ballot ? this.state.ballot.Adjudicator ? `${this.state.ballot.Adjudicator.Person.name} - ` : "" : ""} {this.state.debate.Venue.name}</p>
                                    {
                                        this.state.tab ?
                                            <div className="w-100 text-left">
                                                <a onClick={() => this.setState({redirect: true})}>
                                                    <button className="p-button p-button-outlined p-button-secondary p-mr-1">Back</button>
                                                </a>
                                                {
                                                    this.state.ballot ?
                                                        <a onClick={this.toggleFinalised}>
                                                            {this.state.ballot.finalised ?
                                                                <button
                                                                    className="p-button p-button-outlined p-button-danger">Mark
                                                                    Unfinalised</button>
                                                                :
                                                                <button
                                                                    className="p-button p-button-outlined p-button-success">Mark
                                                                    Finalised</button>
                                                            }
                                                        </a>
                                                        :
                                                        ""
                                                }
                                            </div>
                                            :
                                            <a href={`/tournament/${this.props.match.params.slug}`}>
                                                <Button className="p-button-info" label="Back" icon="pi pi-fw pi-chevron-left"/>
                                            </a>
                                    }
                                <hr/>
                                <div className="p-grid border-bottom">
                                    <div className="p-col border-right">
                                        <TeamQuadrant
                                            opening={true}
                                            position={"OG"}
                                            team={this.state.draw.OG}
                                            cb={(speaker, dict) => this.processInputUpdate("OG", speaker, dict)}
                                        />
                                    </div>
                                    <div className="p-col">
                                        <TeamQuadrant
                                            opening={true}
                                            position={"OO"}
                                            team={this.state.draw.OO}
                                            cb={(speaker, dict) => this.processInputUpdate("OO", speaker, dict)}
                                        />
                                    </div>
                                </div>

                                <div className="p-grid">
                                    <div className="p-col border-right">
                                        <TeamQuadrant
                                            opening={false}
                                            position={"CG"}
                                            team={this.state.draw.CG}
                                            cb={(speaker, dict) => this.processInputUpdate("CG", speaker, dict)}
                                        />
                                    </div>
                                    <div className="p-col">
                                        <TeamQuadrant
                                            opening={false}
                                            position={"CO"}
                                            team={this.state.draw.CO}
                                            cb={(speaker, dict) => this.processInputUpdate("CO", speaker, dict)}
                                        />
                                    </div>
                                </div>
                                <button onClick={this.submit} className="btn btn-block btn-success">Submit</button>
                            </Card>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default BallotPage;