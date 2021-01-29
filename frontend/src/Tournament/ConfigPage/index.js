import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TournamentToolBar from "../../components/TournamentToolBar";
import PersonCard from "../../components/PersonCard";
import Loading from "../../components/Loading";
import InputBox from "../../components/InputBox";
import {Toast} from "primereact/toast";
import {Button} from "primereact/button";
const ttlib = require("ttlib");

class ConfigPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: {},
            TournamentSettings: [],
            people: [],
            tournament: null,
            error: null,
            errors: {}
        }

        this.submitChanges = this.submitChanges.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/public`,
            `GET`,
            (tournamentData) => {
                let settings = {};
                tournamentData.tournament.TournamentSettings.forEach(curSet => {
                    settings[curSet.key] = curSet.value;
                });

                tournamentData.tournament.TournamentRoles.forEach(roleObj => {
                    if (settings[roleObj.role]) {
                        settings[roleObj.role].push({AccountId: roleObj.AccountId, name: roleObj.Account.Person.name});
                    } else {
                        settings[roleObj.role] = [{AccountId: roleObj.AccountId, name: roleObj.Account.Person.name}];
                    }
                });
                this.setState({...tournamentData, settings})
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

        ttlib.api.requestAPI(
            `/tournaments/configuration`,
            `GET`,
            (configurationData) => {
                this.setState({...configurationData})
            },
            (error) => {
                // handle 404
                this.setState({
                    error
                })
            }
        );
    }

    submitChanges() {
        let settingsToUpdate = [];
        Object.keys(this.state.settings).forEach(key => {
            const tournamentCurSet = this.state.tournament.TournamentSettings.find(a => a.key === key);
            const update = tournamentCurSet ? tournamentCurSet.value !== this.state.settings[key] : true
            if (update) {
                settingsToUpdate.push({
                    key,
                    value: this.state.settings[key]
                })
            }
        });

        if (settingsToUpdate.length > 0) {
            ttlib.api.requestAPI(
                `/tournaments/${this.props.match.params.slug}/configuration`,
                `POST`,
                () => {
                    ttlib.component.toastSuccess(this.toast, "Configuration Changed", `Your changes have been completed.`);
                },
                (error) => {
                    ttlib.component.toastError(this.toast, "Configuration Changes Failed", error);
                },
                {
                    settings: settingsToUpdate
                }
            );
        } else {
            ttlib.component.toastError(this.toast, "No Changes Made", "You have not modified any settings.");
        }


    }

    render() {
        return (
            <div>
                <NavBar active=""/>
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug}/>
                        {
                            this.state.tournament ?
                                <Card>
                                    <div className="display-4 text-center w-100">{this.state.tournament.name} - Configuration</div>
                                    <span className="text-left">
                                        <a href={`/tournament/${this.state.tournament.slug}`}>
                                            <Button
                                                icon={"pi pi-arrow-left"}
                                                label="Back"
                                                className="p-button-secondary"
                                            />
                                        </a>
                                    </span>
                                    <hr/>
                                    <table className="table table-striped">
                                        <thead>
                                            <th>Key</th>
                                            <th>Description</th>
                                            <th className="w-50">Value</th>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.TournamentSettings.map(configTemplate => (
                                                <tr key={configTemplate.key}>
                                                    <td>{configTemplate.key}</td>
                                                    <td>{configTemplate.description}</td>
                                                    <td>
                                                        <InputBox
                                                            id={configTemplate.key}
                                                            value={this.state.settings[configTemplate.key]}
                                                            type={configTemplate.type}
                                                            cb={(dict) => {
                                                                let curSettings = this.state.settings;
                                                                Object.keys(dict).forEach(key => {
                                                                    curSettings[key] = dict[key];
                                                                });
                                                                this.setState({
                                                                    settings: curSettings
                                                                })
                                                            }}
                                                            options={() => this.state.people}
                                                            errors={this.state.errors}
                                                            hideLabel={true}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                    <button onClick={this.submitChanges} className="btn btn-block btn-success">Save Changes</button>
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

export default ConfigPage;