import React from "react";
const ttlib = require("ttlib");

class TournamentUserView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adjudicator: null,
            speaker: null,
            tournament: null,
            error: null,
            hasActiveRound: false
        }

        ttlib.api.requestAPI(
            `/tournaments/${props.slug}/participant/me`,
            `GET`,
            (respData) => {
                if (respData.tournament) {
                    const tournament = respData.tournament;
                    if (tournament.Person.Adjudicators.length > 0) {
                    //    User is an adjudicator
                        this.setState({
                            adjudicator: tournament.Person.Adjudicators[0],
                            person: tournament.Person,
                        })
                    } else if (tournament.Person.Speakers.length > 0) {
                    //    User is a speaker
                        this.setState({
                            speaker: tournament.Person.Speakers[0]
                        })
                    }
                }
            },
            (err) => {},
        )
    }


    render() {
        return (
            this.props.loggedIn ?
                <span>
                    {
                        this.state.adjudicator ?
                            <div className="alert" style={{border: 'solid 1px black'}}>
                                You are registered as an {this.state.adjudicator.independent ? "independent " : " "}<b>adjudicator</b> at <i>{this.state.adjudicator.Tournament.name}</i>.
                                <br/>Your name on tab will appear as: '{this.state.person.name}'.
                                <br/>You are currently marked as {this.state.adjudicator.active ? "active, and so will appear in any future generated draws." : "inactive, and so will not appear in any future generated draws."}
                            </div>
                            : ""
                    }
                    {
                        this.state.speaker ?
                            <div className="alert">
                                You are registered as a <b>speaker</b> at <i>{this.state.speaker.Tournament.name}</i>.
                                <br/>Your team name is: '{this.state.speaker.Team.name}'.
                                <br/>Your team <b>codename</b> is: '{this.state.speaker.Team.codename}'.
                                <br/>Your name on the speaker tab will appear as: '{this.state.person.name}'.
                                <br/>You are currently marked as {this.state.speaker.active ? "active, and so will appear in any future generated draws." : "inactive, and so will not appear in any future generated draws."}
                            </div>
                            : ""
                    }
                    {
                        this.state.hasActiveRound ?
                            ""
                            :
                            //    Tournament does not have an active round but the user is logged in.
                            <div className="alert alert-info">At the moment, this tournament isn't running a round you are a participant of.</div>
                    }
                    </span>
                :
                // User is not logged in, show bog standard - register/login link.
                <div className="alert alert-warning">You are not logged in! Tabbi3 is a centralised, account-based tabulation software which means you can access personalised information about a tournament such as your debate venue, position and submit e-Ballots/feedback if you <a href={"/login"}>login!</a></div>


        )
    }
}

export default TournamentUserView;