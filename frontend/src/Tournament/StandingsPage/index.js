import React from "react";
import { Card } from 'primereact/card';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Redirect} from "react-router-dom";
import NavBar from "../../NavBar";
import {Tag} from "primereact/tag";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Knob} from "primereact/knob";
import {Toast} from "primereact/toast";
import Loading from "../../components/Loading";
import {Button} from "primereact/button";
const ttlib = require("ttlib");

class StandingsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            standings: [],
            teamStandings: true
        }

    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/ballots/${this.props.match.params.slug}/public/standings`,
            'GET',
            (standingsData) => {
                const completed = standingsData.completed;
                const standings = standingsData.standings.map(team => {
                    let results = {
                        s1name: team.Speaker1.Person.name,
                        s2name: team.Speaker2.Person.name,
                        name: team.name,
                        s1results: {},
                        s2results: {},
                        teamresults: {},
                        teamTotal: 0,
                        s1Total: 0,
                        s2Total: 0,
                        speakTotal: 0,
                    }
                    team.TeamResults.forEach(tr => {
                        // If swing replacement, give 0.
                        const teamPoints = tr.abnormality ? tr.abnormality === "replacedBySwing" ? 0 : tr.teamPoints : tr.teamPoints;
                        results.teamresults[tr.Ballot.Debate.Round.id] = teamPoints;
                        results.teamTotal += teamPoints;

                        if (completed) {
                            const s1Speaks = tr.abnormality ? tr.abnormality === "speakerTwoSpokeTwice" ? 0 : tr.speakerOneSpeaks : tr.speakerOneSpeaks;
                            const s2Speaks = tr.abnormality ? tr.abnormality === "speakerTwoSpokeTwice" ? 0 : tr.speakerTwoSpeaks : tr.speakerTwoSpeaks;
                            results.s1results[tr.Ballot.Debate.Round.id] = s1Speaks;
                            results.s2results[tr.Ballot.Debate.Round.id] = s2Speaks;
                            results.s1Total += s1Speaks;
                            results.s2Total += s2Speaks;
                        }
                    });
                    results.speakTotal = completed ? results.s1Total + results.s2Total : "-";
                    return results;
                })

                this.setState({standings, completed});
            },
            (err) => {
                console.log(err);
            }
        )

        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/public/rounds`,
            `GET`,
            (respData) => {
                this.setState({
                    rounds: respData.tournament.Rounds.sort((a,b) => a.sequence <= b.sequence ? -1 : 1),
                    tournament: respData.tournament
                })
            },
            (err) => {
                console.log(err);
            }
        )
    }

    render() {
        const teamRow = (teamResultObj, roundId) => {
            const resultMap = ["4th", "3rd", "2nd", "1st"];
            return <span>{resultMap[teamResultObj.teamresults[roundId]] || "-"}</span>
        }

        const speakerRow = (speakerResultObj, roundId) => {
            return <span>{speakerResultObj.roundResults[roundId] || "-"}</span>
        }

        const getStandings = (teamStandings) => {
            if (!this.state.standings) {
                return [];
            }
            if (teamStandings) {
                return this.state.standings.sort(
                    (teamOne, teamTwo) => {
                        if (teamOne.teamTotal < teamTwo.teamTotal) {
                            return 1;
                        } else if (teamTwo.teamTotal < teamOne.teamTotal) {
                            return -1;
                        } else {
                            if (this.state.completed) {
                                const t1sTotal = teamOne.speakTotal;
                                const t2sTotal = teamTwo.speakTotal;
                                if (t1sTotal < t2sTotal) {
                                    return 1;
                                } else if (t2sTotal < t1sTotal) {
                                    return -1;
                                }
                            }
                            return teamOne.name < teamTwo.name ? -1 : 1;
                        }
                    }
                ).map((team, i, standings) => {
                    const prevTied = standings[i-1] !== undefined && standings[i-1].teamTotal === team.teamTotal && standings[i-1].speakTotal === team.speakTotal;
                    const nextTied = standings[i+1] !== undefined && standings[i+1].teamTotal === team.teamTotal && standings[i+1].speakTotal === team.speakTotal;
                    team.nRank = prevTied ? standings[i-1].nRank : i + 1;
                    team.rank = team.nRank.toString() + (prevTied || nextTied ? "=" : "");
                    return team;
                })
            } else {
                return this.state.standings.map(standing => {
                    return [
                        {
                            speakerName: standing.s1name,
                            name: standing.name,
                            totalSpeaks: standing.s1Total,
                            roundResults: standing.s1results
                        },
                        {
                            speakerName: standing.s2name,
                            name: standing.name,
                            totalSpeaks: standing.s2Total,
                            roundResults: standing.s2results
                        }
                    ]
                }).flat().sort((speakerOne, speakerTwo) => {
                    if (speakerOne.totalSpeaks < speakerTwo.totalSpeaks) {
                        return 1;
                    } else if (speakerTwo.totalSpeaks < speakerOne.totalSpeaks) {
                        return -1;
                    } else {
                        return speakerOne.speakerName < speakerTwo.speakerName ? -1 : 1;
                    }
                }).map((speaker, i, standings) => {
                    const prevTied = standings[i-1] !== undefined && standings[i-1].totalSpeaks === speaker.totalSpeaks;
                    const nextTied = standings[i+1] !== undefined && standings[i+1].totalSpeaks === speaker.totalSpeaks;
                    speaker.nRank = prevTied ? standings[i-1].nRank : i + 1;
                    speaker.rank = speaker.nRank.toString() + (prevTied || nextTied ? "=" : "");
                    return speaker;
                })
            }
        }

        const columns = (teamStandings) => {
            let cols = [];
            if (teamStandings) {
                this.state.rounds.forEach(round => (
                    cols.push(<Column key={round.id} body={(row) => teamRow(row, round.id)} header={`R${round.title.split(" ")[1]}`}/>)
                ))
            } else {
                cols.push(<Column key="speakerName" field="speakerName" header="Speaker Name"/>)
                cols.push(<Column key="name" field="name" header="Team Name"/>)
                this.state.rounds.forEach(round => (
                    cols.push(<Column key={round.id} body={(row) => speakerRow(row, round.id)} header={`R${round.title.split(" ")[1]}`}/>)
                ))
            }
            return cols;
        }

        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                {this.state.selected ? <Redirect to={`/tournament/${this.props.match.params.slug}/adjudicators/${this.state.selected.id}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/>
                        {
                            this.state.standings && this.state.rounds ?
                            <Card>
                                <div className="display-4 text-center">{this.state.teamStandings ? "Team" : "Speaker"} Standings - {this.state.tournament.name}</div>
                                <div className="text-center">
                                    <Button onClick={() => this.setState({teamStandings: !this.state.teamStandings})} label={`${this.state.teamStandings ? "Speaker" : "Team"} Standings`}/>
                                </div>
                                <hr/>
                                <DataTable
                                    value={getStandings(this.state.teamStandings)}
                                    paginator
                                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10,20,50]}
                                >
                                    <Column key={"rank"} field="rank" header="Rank"/>
                                    {
                                        this.state.teamStandings ? <Column key={"name"} field="name" header="Team Name"/> : null
                                    }
                                    {columns(this.state.teamStandings)}
                                    <Column key={"teamTotal"} field="teamTotal" header="Team Points"/>
                                    <Column key={"speakTotal"} field="speakTotal" header="Speaker Points"/>
                                </DataTable>
                            </Card> : <Loading/>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default StandingsPage;