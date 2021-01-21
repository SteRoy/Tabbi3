import React from 'react';
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import InputBox from "../../components/InputBox";
const ttlib = require("ttlib");

class CreateTournamentPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            people: [],
            errors: {}
        }
        this.fields = [
            {id: "name", label: "Tournament Name", type: "text", tooltip: "The name you want your tournament to be displayed under"},
            {id: "startDate", label: "Start Date", type: "date", tooltip: "The time your competition begins.", time: true},
            {id: "endDate", label: "End Date", type: "date", tooltip: "The time your competition ends.", time: true},
            {id: "orgcomm", label: "Organisation Committee", type: "person", tooltip: "The individuals who should make eligibility decisions.", options: () => this.state.people},
            {id: "tab", label: "Tabulation Team", type: "person", tooltip: "The super user access.", options: () => this.state.people},
            {id: "adjcore", label: "Adjudication Core", type: "person", tooltip: "The individuals who comprise your adjudication core - motion setting, allocations, feedback.", options: () => this.state.people}
        ]
    }

    componentDidMount() {
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


    render() {
        return(
            <div>
                <NavBar active="tournamentCreate" userCB={(user, loggedIn) => this.setState({user, loggedIn})}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-8">
                        <Card>
                            <div className="display-4 text-center">New Tournament</div>
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
                                    />
                                ))
                            }
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateTournamentPage