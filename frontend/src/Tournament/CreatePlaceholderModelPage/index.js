import React from 'react';
import NavBar from "../../NavBar";
import InputBox from "../../components/InputBox";
import {Button} from "primereact/button";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Redirect} from "react-router-dom";
import {Card} from "primereact/card";
import {Toast} from "primereact/toast";
const crypto = require("crypto");
const ttlib = require("ttlib");

class CreatePlaceholderModelPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slug: props.match.params.slug,
            model: props.match.params.model,
            testScore: 0,
            redirect: !["teams", "adjudicators", "venues"].includes(props.match.params.model),
            errors: {}
        }

        this.teamFields = [
                {id: "name", label: "Team Name", type: "text", tooltip: "The name of the placeholder team.", required: true},
                {id: "codename", label: "Codename", type: "text", tooltip: "The codename of the placeholder team.", required: true},
                {id: "s1name", label: "Speaker 1 Name", type: "text", tooltip: "The name to be used for this placeholder team. This performance will be unclaimable by a Tabbi3 account.", required: true},
                {id: "s2name", label: "Speaker 2 Name", type: "text", tooltip: "The name to be used for this placeholder team. This performance will be unclaimable by a Tabbi3 account.", required: true},
            ];

        this.judgeFields = [
                {id: "name", label: "Placeholder Adjudicator Name", type: "text", tooltip: "The name of the placeholder adjudicator.", required: true},
                {id: "testScore", label: "Adjudicator Test Score", type: "ranking", tooltip: "The base score for the placeholder adjudicator.", required: true},
                {id: "independent", label: "Independent Adjudicator", type: "boolean", tooltip: "Is this an independent adjudicator?", required: false, default: false},
            ];

        this.venueFields = [
            {id: "name", label: "Venue Name", type: "text", tooltip: "The venue name", required: true},
        ]

        this.fields = props.match.params.model === "teams" ? this.teamFields : props.match.params.model === "adjudicators" ? this.judgeFields : this.venueFields;

        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        if (this.state.model === "teams") {
            ["s1name", "s2name"].forEach(key => {
                this.setState({
                    [key]: `Swing Speaker ${crypto.randomBytes(1).toString("hex").toUpperCase()}`
                })
            })
        } else if (this.state.model === "adjudicators") {
            this.setState({
                name: `Swing Judge ${crypto.randomBytes(1).toString("hex").toUpperCase()}`
            })
        }
    }

    submit(event) {
        event.preventDefault();
        ttlib.validation.objContainsFields(this.state, this.fields.filter(f => f.required).map(f => f.id)).then(() => {
            let formObj = {};
            this.fields.forEach(field => {
                formObj[field.id] = this.state[field.id] || field.default;
            });
            ttlib.api.requestAPI(
                `/tournaments/${this.state.slug}/${this.state.model}${this.state.model !== "venues" ? '/placeholder' : ''}/create`,
                `POST`,
                (respData) => {
                    this.setState({
                        redirect: true
                    })
                },
                (err) => {
                    ttlib.component.toastError(this.toast, "Creation Failed", err);
                },
                formObj
            )
        }).catch(missing => {
            this.setState({
                errors: {
                    [missing]: `You must fill out this field.`
                }
            })
        })
    }


    render() {
        return(
            <div>
                <NavBar active="" userCB={(user, loggedIn) => this.setState({user, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                {this.state.redirect ? <Redirect to={`/tournament/${this.state.slug}`}/> : "" }
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-8">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/>
                        <Card>
                            <form onSubmit={this.submit}>
                                <div className="display-4 text-center">Create{this.state.model !== "venues" ? " Placeholder " : " "}{this.state.model === "teams" ? "Team" : this.state.model === "venues" ? "Venue" : "Adjudicator"}</div>
                                {
                                    this.state.model === "teams" ?
                                        <div className="alert alert-info text-center">This tool is only for creating <b>break ineligible</b> swing/placeholder teams required to make the tournament team count divisible by 4. These teams will be exempted from institutional clash and will not be included in the break calculations.</div>
                                        :
                                        this.state.model === "adjudicators" ?
                                        <div className="alert alert-info text-center">This tool is only for creating <b>break ineligible</b> placeholder adjudicators for a rapid stand in adjudicator. They will not be able to submit e-ballots, submit feedback, receive feedback or be marked as breaking.</div>
                                        : ""
                                }
                                <hr/>
                                {
                                    this.fields.map(field => (
                                        <InputBox
                                            id={field.id}
                                            value={this.state[field.id]}
                                            cb={(dict) => this.setState(dict)}
                                            errors={this.state.errors}
                                            type={field.type}
                                            label={field.label}
                                            tooltip={field.tooltip}
                                            options={field.options}
                                            multiple={true}
                                            min={field.min}
                                            max={field.max}
                                        />
                                    ))
                                }
                                <Button className="btn btn-block p-button-success p-mt-2" label="Create"/>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreatePlaceholderModelPage