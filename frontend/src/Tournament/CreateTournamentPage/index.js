import React from 'react';
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import InputBox from "../../components/InputBox";
import {Button} from "primereact/button";
import {Checkbox} from "primereact/checkbox";
import {Redirect} from "react-router-dom";
const ttlib = require("ttlib");

class CreateTournamentPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            people: [],
            orgcomm: [],
            adjcore: [],
            equity: [],
            tab: [],
            errors: {},
            settings: {}
        }
        this.fields = [
            {id: "name", label: "Tournament Name", type: "text", tooltip: "The name you want your tournament to be displayed under", required: true},
            {id: "startDate", label: "Start Date", type: "date", tooltip: "The time your competition begins.", time: true, required: true},
            {id: "endDate", label: "End Date", type: "date", tooltip: "The time your competition ends.", time: true, required: true},
            {id: "rounds", label: "Rounds", type: "number", tooltip: "The number of inrounds.", min: 1, max: 9, required: true},
            {id: "tab", label: "Tabulation Team", type: "people", tooltip: "The super user access.", options: () => this.state.people, required: true},
            {id: "orgcomm", label: "Organisation Committee", type: "people", tooltip: "The individuals who should make eligibility decisions.", options: () => this.state.people},
            {id: "adjcore", label: "Adjudication Core", type: "people", tooltip: "The individuals who comprise your adjudication core - motion setting, allocations, feedback.", options: () => this.state.people},
            {id: "equity", label: "Equity Team", type: "people", tooltip: "The individuals who approve clash to be included in the competition.", options: () => this.state.people}
        ];

        this.settings = [
            {id: "test", label: "Test Tournament", type: "boolean", description: "This is a test tournament for getting to know Tabbi3, it will not count towards participant metrics.", default: true},
            {id: "wudc", label: "WUDC Restrictions", type: "boolean", description: "Restricts certain tabulation options in line with the WUDC Constitution.", default: true}
        ]

        this.submit = this.submit.bind(this);
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

        let curSet = this.state.settings;
        this.settings.forEach(setting => {
            curSet[setting.id] = setting.default;
        });
        this.setState({
            settings: curSet
        });
    }

    submit() {
        ttlib.validation.objContainsFields(this.state, this.fields.filter(f => f.required).map(f => f.id)).then(postForm => {
            ttlib.api.requestAPI(
                `/tournaments/create`,
                `POST`,
                (respData) => {
                    this.setState({
                        slug: respData.slug
                    })
                },
                () => {},
                {
                    name: postForm.name,
                    startDate: postForm.startDate,
                    endDate: postForm.endDate,
                    rounds: postForm.rounds,
                    tab: postForm.tab.map(x => x.id),
                    orgcomm: this.state.orgcomm.map(x => x.id),
                    adjcore: this.state.adjcore.map(x => x.id),
                    equity: this.state.equity.map(x => x.id),
                    settings: this.state.settings
                }
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
                <NavBar active="tournamentCreate" userCB={(user, loggedIn) => this.setState({user, loggedIn})}/>
                {this.state.slug ? <Redirect to={`/tournament/${this.state.slug}`}/> : ""}
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
                                        min={field.min}
                                        max={field.max}
                                    />
                                ))
                            }
                            <hr/>
                            <div className="display-5 mb-3">Tournament Settings</div>
                            {
                                this.settings.map((setting) => {
                                    return (
                                        <div key={`div-${setting.id}`} className="p-field-checkbox">
                                            <Checkbox
                                                inputId={setting.id}
                                                name={setting.id}
                                                checked={this.state.settings[setting.id]}
                                                onChange={
                                                    (e) => {
                                                        let curSet = this.state.settings;
                                                        curSet[e.target.name] = e.checked;
                                                        this.setState({
                                                                settings: curSet
                                                            }
                                                        )
                                                    }
                                                }
                                            />
                                            <label htmlFor={`label-${setting.id}`}>{setting.label} - <small>{setting.description}</small></label>
                                        </div>
                                    )
                                })
                            }
                            <Button onClick={this.submit} className="btn btn-block p-button-success" label="Create"/>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateTournamentPage