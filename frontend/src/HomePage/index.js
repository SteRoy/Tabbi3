import React from "react";
import NavBar from "../NavBar";
import {Card} from "primereact/card";
import TournamentCard from "../components/TournamentCard";
import { Button } from 'primereact/button';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            loggedIn: false
        }
    }

    render() {
        return (
            <div>
                <NavBar active="home" userCB={(user, loggedIn) => this.setState({loggedIn, user})}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        {
                            this.state.loggedIn ?
                                this.state.user.Person.InstitutionMemberships.length === 0 ?
                                    <a href={`/profile/me`}>
                                        <div className="alert alert-danger">
                                            <span className="pi pi-fw pi-exclamation-circle text-danger display-5" style={{'fontSize': '1.5em'}}/>
                                            <span style={{'fontSize': '1.5em'}}> You have not set any current or previous institutions. Institutional clash will not apply to you. You can add an institution by clicking this alert.</span>
                                        </div>
                                    </a>
                                    : ""
                                : ""
                        }
                        <Card>
                            <div className="display-4 text-center w-100">Current Tournaments</div>
                            <hr/>
                            <div className="p-grid p-justify-center">
                                <div className="p-xl-3 p-lg-3 p-md-3 p-col-6">
                                    <a href="/tournament/doxbridge-valentine's-day-open-5a6c2e">
                                        <TournamentCard
                                            title="Doxbridge Valentine's Day Open"
                                            description={"Doxbridge Debating is proud to present the first opportunity to show your significant other why you abandon them every weekend to take part in online debating competitions."}
                                        />
                                    </a>
                                </div>
                            </div>
                            <hr/>
                            <div className="text-center p-grid">
                                <div className="p-col mr-2">
                                    <a href="/tournaments/create">
                                        <Button icon="pi pi-plus" className="p-button-primary" label="Create a Tournament"/>
                                    </a>
                                </div>

                                <div className="p-col">
                                    <a href="/tournaments">
                                        <Button icon="pi pi-calendar" className="p-button-secondary" label="View Archived Tournaments"/>
                                    </a>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;