import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TournamentToolBar from "../../components/TournamentToolBar";
import PersonCard from "../../components/PersonCard";
import Loading from "../../components/Loading";
import TournamentUserView from "./TournamentUserView";
import {SplitButton} from "primereact/splitbutton";
const ttlib = require("ttlib");

class TournamentHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tournament: null,
            error: null,
            loggedIn: false,
            loggedInUser: {}
        }
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
    }

    render() {
        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug}/>
                        {
                            this.state.tournament ?
                                <Card>
                                    <div className="display-4 text-center w-100">{this.state.tournament.name}</div>
                                    <div className="text-center">
                                        <SplitButton label="Draw" icon="pi pi-fw pi-table" className="p-mr-1 p-button-primary" />
                                        <SplitButton label="Results" icon="pi pi-fw pi-info" className="p-mr-1 p-button-secondary" />
                                        <SplitButton label="Standings" icon="pi pi-fw pi-star" className="p-mr-1 p-button-help" />
                                    </div>
                                    <hr/>
                                    <div className="p-grid">
                                        <div className="p-col p-justify-center" style={{borderRight: "1px solid rgb(0,0,0,.1)"}}>
                                            {
                                                this.state.tournament.TournamentSettings.filter(setting => setting.key === "description").map(desc => (
                                                    <p>
                                                        {desc.value}
                                                    </p>
                                                ))
                                            }
                                            <hr/>
                                            <TournamentUserView
                                                loggedInUser={this.state.loggedInUser}
                                                loggedIn={this.state.loggedIn}
                                                tournament={this.state.tournament}
                                            />
                                        </div>
                                        {/* Render publicly available permission assignment */}
                                        <div className="p-col p-mx-1">
                                        {
                                            [
                                                {id: 'orgcomm', header: "Organisation Committee"},
                                                {id: 'tab', header: "Tabulation Team"},
                                                {id: 'adjcore', header: "Adjudication Core"},
                                                {id: 'equity', header: "Equity Team"}
                                            ].map(team => (
                                                this.state.tournament.TournamentRoles.filter(a => a.role === team.id).length > 0 ?
                                                <span>
                                                    <div className="text-center display-5">{team.header}</div>
                                                    <div className="p-grid">
                                                    {

                                                        this.state.tournament.TournamentRoles.filter(a => a.role === team.id).map(tr => (
                                                            <PersonCard
                                                                name={tr.Account.Person.name}
                                                            />
                                                        ))
                                                    }

                                                    </div>
                                                    <hr/>
                                                </span> : ""
                                                ))
                                        }
                                    </div>
                                    </div>
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

export default TournamentHome;