import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TournamentToolBar from "../../components/TournamentToolBar";
import Loading from "../../components/Loading";
import InputBox from "../../components/InputBox";
import {Button} from "primereact/button";
import {Toast} from "primereact/toast";
import {Redirect} from "react-router-dom";
const ttlib = require("ttlib");

class PreRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            loggedInUser: {},
            errors: {},
            type: {},
            people: [],
            redirect: false
        }

        this.fields = [
            {id: "reference", type: "text", label: "Registration E-mail", tooltip: "This is the email you used when paying/obtatining a team slot - this will be used by org comm to verify you paid for your team slot.", required: true},
            {id: "type", type: "dropdown", label: "Registration Type", options: () => [{id: "team", label: "Team"}, {id: "adjudicator", label: "Adjudicator"}], required: true}
        ];

        this.teamFields = [
            {id: "speakerTwoId", type: "person", label: "Your Speaking Partner", options: () => this.state.people, tooltip: "The Tabbi3 account of the person you'll be speaking with. They must register for an account to appear in this list."},
            {id: "teamName", type: "text", label: "Team Name", tooltip: "Your team name as it will appear on tab - subject to approval.", required: true}
        ];

        this.register = this.register.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/public`,
            `GET`,
            (tournamentData) => {
                this.setState({...tournamentData})
            },
            (error) => {
                // handle 404
                this.setState({
                    error
                })
            }
        );

        ttlib.api.requestAPI(
            '/people',
            'get',
            (respData) => {
                this.setState({
                    people: respData.people
                })
            },
            (errorMessage) => {}
        )
    }

    register(e) {
        e.preventDefault();

        let fieldsList = this.fields;

        if (this.state.type.id === "team") {
            fieldsList = fieldsList.concat(this.teamFields);
        }

        let errors = {};
        let hasError = false;
        let requestObj = {};
        fieldsList.forEach(field => {
            if (field.required && !this.state[field.id]) {
                errors[field.id] = `You must complete this field.`;
                hasError = true;
            } else {
                if (field.type === "person") {
                    requestObj[field.id] = this.state[field.id][0].id;
                } else if (field.type === "dropdown") {
                    requestObj[field.id] = this.state[field.id].id;
                } else {
                    requestObj[field.id] = this.state[field.id];
                }
            }
        });

        if (hasError) {
            this.setState({errors})
        } else {
            // actually pre-reg
            ttlib.api.requestAPI(
                `/preregistration/${this.props.match.params.slug}`,
                "POST",
                (respData) => {
                    ttlib.component.toastSuccess(this.toast, `Preregistered`, `You've been preregistered for this tournament.`);
                    this.setState({
                        redirect: true
                    })
                },
                (error) => {
                    ttlib.component.toastError(this.toast, `Preregistration Failed`, `Preregistration failed: ${error}`)
                },
                requestObj
            )
        }
    }

    render() {
        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                {
                    this.state.redirect ? <Redirect to={`/tournament/${this.props.match.params.slug}`}/> : ""}
                }
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-8">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser}/>
                        {
                            this.state.loggedInUser && this.state.tournament ?
                                <Card>
                                    <div className="display-4 text-center w-100">Preregistration - {this.state.tournament.name}</div>
                                    <hr/>
                                    <form onSubmit={this.register}>
                                        {
                                            this.fields.map(field => (
                                                <InputBox
                                                    id={field.id}
                                                    label={field.label}
                                                    cb={(dict) => this.setState(dict)}
                                                    value={this.state[field.id]}
                                                    tooltip={field.tooltip}
                                                    type={field.type || "text"}
                                                    errors={this.state.errors}
                                                    options={field.options}
                                                />
                                            ))
                                        }
                                        {
                                            this.state.type.id === "team" ?
                                                this.teamFields.map(field => (
                                                    <InputBox
                                                        id={field.id}
                                                        label={field.label}
                                                        cb={(dict) => this.setState(dict)}
                                                        value={this.state[field.id]}
                                                        tooltip={field.tooltip}
                                                        type={field.type || "text"}
                                                        errors={this.state.errors}
                                                        options={field.options}
                                                    />
                                                ))
                                                : ""
                                        }
                                        <Button label="Register" className="p-button-raised p-button-success p-mt-4" type="submit"/>
                                    </form>
                                </Card>
                                :
                                this.state.error ?
                                    <p className="alert alert-danger display-5 text-center">
                                        {this.state.error}
                                    </p>
                                    :
                                    <Loading/>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default PreRegistration;