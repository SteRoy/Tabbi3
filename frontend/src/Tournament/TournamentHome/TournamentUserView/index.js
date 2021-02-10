import React from "react";
import {Button} from "primereact/button";
import Loading from "../../../components/Loading";
const ttlib = require("ttlib");

class TournamentUserView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adjudicator: null,
            speaker: null,
            tournament: null,
            error: null,
            hasActiveRound: false,
            loading: true,
            prereg: []
        }

        ttlib.api.requestAPI(
            `/tournaments/${props.tournament.slug}/participant/me`,
            `GET`,
            (respData) => {
                if (respData.tournament) {
                    const tournament = respData.tournament;
                    let stateUpdate = {
                        person: tournament.Person,
                        prereg: tournament.Person.speakerTwo.length > 0 ? tournament.Person.speakerTwo : tournament.Person.registrant,
                        loading: false
                    }

                    if (tournament.Person.Adjudicators.length > 0) {
                    //    User is an adjudicator
                        stateUpdate.adjudicator = tournament.Person.Adjudicators[0];
                    } else if (tournament.Person.Speakers.length > 0) {
                    //    User is a speaker
                        stateUpdate.speaker = tournament.Person.Speakers[0];
                    }
                    this.setState(stateUpdate);
                }
            },
            (err) => {
                if (this.props.loggedIn) {
                    ttlib.component.toastError(this.props.toast, `Fetching Participant Info Failed`, `${err}`)
                }
                this.setState({loading: false});
            },
        )

        this.replyToInvite = this.replyToInvite.bind(this);
    }

    replyToInvite(status) {
        ttlib.api.requestAPI(
            `/preregistration/invite/${this.state.prereg[0].id}/${status}`,
            `POST`,
            (respData) => {
                ttlib.component.toastSuccess(this.props.toast, `Invitation Status Updated`, `Your response has been submitted.`)
            },
            (error) => {
                ttlib.component.toastError(this.props.toast, `Invitation Update Failed`, `${error}`)
            },
            {}
        )
    }


    render() {
        const isPreRegOpenSetting = this.props.tournament.TournamentSettings.find(setting => setting.key === "prereg") || {value: false};
        return (
            this.props.loggedIn ?
                this.state.loading ?
                    <Loading/>
                    :
                    this.state.adjudicator || this.state.speaker ?
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
                        this.state.prereg.length > 0 ?
                            this.state.prereg[0].registrantId === this.props.loggedInUser.Person.id ?
                                <div className="alert alert-info">
                                    You completed {ttlib.string.toTitleCase(this.state.prereg[0].type)} preregistration on {new Date(this.state.prereg[0].createdAt).toDateString()}:
                                    <br/>
                                    Reference: <b>{this.state.prereg[0].reference}</b><br/>
                                    {
                                        this.state.prereg[0].type === "team" ?
                                            <span>
                                                Team Name: <b>{this.state.prereg[0].teamName}</b><br/>
                                                Speaking Partner: <b className={this.state.prereg[0].speakerTwoAccepted ? "text-success" : "text-danger"}>{this.state.prereg[0].speakerTwo.name} {this.state.prereg[0].speakerTwoAccepted ? "" : "[PENDING]"}</b>
                                            </span>
                                            : ""
                                    }
                                    <hr/>
                                    {this.state.prereg[0].speakerTwoAccepted ?
                                        "Once your preregistration has been approved by the organisation committee, your team details will appear here."
                                        :
                                        "Once your partner has accepted this invitation, your preregistration will be submitted to the organisation committee."
                                    }
                                </div>
                                :
                                <div className="alert alert-info">
                                    You were invited to join the a team on {new Date(this.state.prereg[0].createdAt).toDateString()} by <b>{this.state.prereg[0].registrant.name}</b>:
                                    <br/>
                                    Reference: <b>{this.state.prereg[0].reference}</b><br/>
                                    {
                                        this.state.prereg[0].type === "team" ?
                                            <span>
                                                Team Name: <b>{this.state.prereg[0].teamName}</b><br/>
                                            </span>
                                            : ""
                                    }
                                    <hr/>
                                    {this.state.prereg[0].speakerTwoAccepted ?
                                        "Once your preregistration has been approved by the organisation committee, your team details will appear here."
                                        :
                                        <span>
                                            You must accept or decline this invitation to submit your preregistration to the organisation committee.
                                            <div className='text-center'>
                                                <Button icon="pi pi-fw pi-check" label="Accept" onClick={() => this.replyToInvite('accept')} className="p-button-success p-mr-1"/>
                                                <Button icon="pi pi-fw pi-times" label="Reject" onClick={() => this.replyToInvite('reject')} className="p-button-danger"/>
                                            </div>
                                        </span>
                                    }


                                </div>
                            :
                            <div className="alert alert-warning">
                                You're not currently registered as a participant for this competition. {isPreRegOpenSetting.value ? <span>You can complete preregistration by clicking <a href={`/tournament/${this.props.tournament.slug}/prereg`}>here</a></span> : ""}
                            </div>
                    :
                    // User is not logged in, show bog standard - register/login link.
                    <div className="alert alert-warning">You are not logged in! Tabbi3 is a centralised, account-based tabulation software which means you can access personalised information about a tournament such as your debate venue, position and submit e-Ballots/feedback if you <a href={"/login"}>login!</a></div>


        )
    }
}

export default TournamentUserView;