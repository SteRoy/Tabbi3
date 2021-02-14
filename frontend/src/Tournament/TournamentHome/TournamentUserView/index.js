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
            loading: true,
            roundLoading: true,
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
                        this.fetchAlloc();
                    } else if (tournament.Person.Speakers.length > 0) {
                    //    User is a speaker
                        stateUpdate.speaker = tournament.Person.Speakers[0];
                        stateUpdate.team = tournament.Person.Speakers[0].Speaker1 || tournament.Person.Speakers[0].Speaker2;
                        this.fetchAlloc();
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
        this.fetchAlloc = this.fetchAlloc.bind(this);
    }

    fetchAlloc() {
        if (!this.props.loggedInUser) {
            return;
        }

        ttlib.api.requestAPI(
            `/tournaments/${this.props.tournament.slug}/participant/${this.props.loggedInUser.Person.id}/allocation`,
            `GET`,
            (respData) => {
                if (respData.round) {
                    const round = respData.round;
                    const debate = respData.debate;
                    let allocation;
                    if (this.state.adjudicator) {
                        allocation = debate.AdjAllocs.find(a => a.AdjudicatorId === this.state.adjudicator.id);
                    } else if (this.state.team) {
                        allocation = debate.TeamAllocs.find(a => a.TeamId === this.state.team.id);
                    }

                    this.setState({round, debate, allocation, roundLoading: false});
                }
            },
            (err) => {
                this.setState({roundLoading: false});
            },
        )
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

        const eBallot = () => {
            const eballots = this.props.tournament.TournamentSettings.find(ts => ts.key === "eballots") || {value: false};
            const eballotsPanels = this.props.tournament.TournamentSettings.find(ts => ts.key === "eballots-panel") || {value: false};

            if (this.state.allocation) {
                if (eballotsPanels || (eballots && this.state.allocation.chair)) {
                    //    yes, eballot /tournament/:slug/:debateid/eballot
                    return <div className="text-center">
                        <a href={`/tournament/${this.props.tournament.slug}/${this.state.debate.id}/eballot`}>
                            <Button icon="pi pi-fw pi-envelope" label="E-Ballot"/>
                        </a>
                    </div>
                }
            }
            return "";
        }

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
                                <div className="alert" style={{border: 'solid 1px black'}}>
                                    You are registered as a <b>speaker</b> at <i>{this.state.team.Tournament.name}</i>.
                                    <br/>Your team name is: '{this.state.team.name}'.
                                    <br/>Your team <b>codename</b> is: '{this.state.team.codename}'.
                                    <br/>Your name on the speaker tab will appear as: '{this.state.person.name}'.
                                    <br/>You are currently marked as {this.state.team.active ? "active, and so will appear in any future generated draws." : "inactive, and so will not appear in any future generated draws."}
                                </div>
                                : ""
                        }
                        {
                            this.state.roundLoading ?
                                <Loading/>
                            :
                                this.state.round && this.state.allocation ?
                                    <div className="alert" style={{border: 'solid 1px black'}}>
                                        <span className="display-5">{this.state.round.title}</span>
                                        <hr/>
                                        {
                                            this.state.speaker ?
                                                <div>
                                                    You are <b>{this.state.allocation.position}</b> in <b>{this.state.debate.Venue.name}</b>.
                                                    <br/><br/>
                                                    {
                                                        this.state.round.motion !== "" ?
                                                            <div className="alert alert-info">
                                                                {
                                                                    this.state.round.infoslide ?
                                                                        <span>
                                                                            <b>Infoslide:</b>
                                                                            <p>{this.state.round.infoslide}</p>
                                                                        </span>
                                                                        : ""
                                                                }
                                                                <b>Motion: </b> <p>{this.state.round.motion}</p>
                                                            </div> : "Motion is not yet released."
                                                    }
                                                    {this.state.debate.Venue.name}:<br/>
                                                    OG:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "OG").Team.name}<br/>
                                                    OO:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "OO").Team.name}<br/>
                                                    CG:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "CG").Team.name}<br/>
                                                    CO:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "CO").Team.name}<br/>
                                                    <br/>
                                                    Your chair is: <span>{this.state.debate.AdjAllocs.filter(adj => adj.chair).map(adj => <b>&copy; {adj.Adjudicator.Person.name}</b>)}</span> <br/>
                                                    Your adjudication panel is: {this.state.debate.AdjAllocs.filter(adj => !adj.chair).map(adj => adj.Adjudicator.Person.name).join(", ")}
                                                </div>
                                                :
                                                <div>
                                                    {
                                                        eBallot()
                                                    }
                                                    You are <b>{this.state.allocation.chair ? "Chair" : "Panellist"}</b> in <b>{this.state.debate.Venue.name}</b>.
                                                    <br/>
                                                    {
                                                        this.state.round.motion !== "" ?
                                                            <div className="alert alert-info">
                                                                {
                                                                    this.state.round.infoslide ?
                                                                        <span>
                                                                            <b>Infoslide:</b>
                                                                            <p>{this.state.round.infoslide}</p>
                                                                        </span>
                                                                        : ""
                                                                }
                                                                <b>Motion: </b> <p>{this.state.round.motion}</p>
                                                            </div> : "Motion is not yet released."
                                                    }
                                                    {this.state.debate.Venue.name}:<br/>
                                                    OG:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "OG").Team.name}<br/>
                                                    OO:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "OO").Team.name}<br/>
                                                    CG:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "CG").Team.name}<br/>
                                                    CO:&#09;{this.state.debate.TeamAllocs.find(ta => ta.position === "CO").Team.name}<br/>
                                                    <br/>
                                                    The chair is: <span>{this.state.debate.AdjAllocs.filter(adj => adj.chair).map(adj => <b>&copy; {adj.Adjudicator.Person.name}</b>)}</span> <br/>
                                                    The adjudication panel is: {this.state.debate.AdjAllocs.filter(adj => !adj.chair).map(adj => adj.Adjudicator.Person.name).join(", ")}
                                                </div>
                                        }
                                    </div>
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