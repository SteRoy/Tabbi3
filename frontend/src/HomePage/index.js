import React from "react";
import NavBar from "../NavBar";
import {Card} from "primereact/card";
import TournamentCard from "../components/TournamentCard";
import { Button } from 'primereact/button';

class HomePage extends React.Component {

    render() {
        return (
            <div>
                <NavBar active="home"/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <Card>
                            <div className="display-4 text-center w-100">Current Tournaments</div>
                            <hr/>
                            <div className="p-grid p-justify-center">
                                <div className="p-xl-3 p-lg-3 p-md-3 p-col-6">
                                    <TournamentCard
                                        title="Doxbridge Worlds 2021"
                                        description={"Doxbridge Worlds 2021 aims to be the largest ever debating tournament, and a post-NYE filler for those of you who haven't managed to get your competitive debating fix over the holidays."}
                                    />
                                </div>
                            </div>
                            <hr/>
                            <div className="text-center">
                                <Button icon="pi pi-plus" className="p-button-primary" label="Create a Tournament"/>
                                <a href="/tournaments">
                                    <Button icon="pi pi-calendar" className="ml-5 p-button-secondary" label="View Archived Tournaments"/>
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;