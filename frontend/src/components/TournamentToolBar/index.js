import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {SplitButton} from 'primereact/splitbutton';
import {isMobile} from 'react-device-detect';
import * as ttlib from "ttlib";

class TournamentToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: isMobile,
            slug: props.slug,
            role: null,
            TournamentRoles: []
        }

        this.splitOptionsTeams = null;
        this.splitOptionsAdjudicators = null;
        this.splitOptionsVenues = null;

        // Since the splitbutton menus are going to be so closely linked, we can generate them in this neat way.
        [this.splitOptionsTeams, this.splitOptionsAdjudicators, this.splitOptionsVenues] = ["teams", "adjudicators", "venues"].map(objType => {
            let options = [
                {
                    label: `Create${objType !== "venues" ? ' Placeholder' : ' Venue'}`,
                    icon: 'pi pi-plus',
                    command: (e) => {
                        window.location.pathname = `/tournament/${this.props.slug}/create/${objType}`;
                    }
                },
                {
                    label: 'List',
                    icon: 'pi pi-align-justify',
                    command: (e) => {
                        window.location.pathname = `/tournament/${this.props.slug}/list/${objType}`;
                    }
                }
            ];

            if (objType !== "venues") {
                const objName = objType.substr(0, objType.length - 1);
                options.push(
                    {
                        label: 'Prereg',
                        icon: 'pi pi-ticket',
                        command: (e) => {
                            window.location.pathname = `/tournament/${this.props.slug}/prereg/${objName}`;
                        }
                    }
                )
            }

            return options;
        });

        this.roundOptions = [
                {
                    label: 'Create Round',
                    icon: 'pi pi-plus',
                    command: (e) => {
                        ttlib.api.requestAPI(
                            `/tournaments/${this.props.slug}/rounds/create`,
                            'POST',
                            (respData) => {
                                window.location.pathname = `/tournament/${this.props.slug}/round/${respData.round.id}`;
                            },
                            (err) => {
                                console.error(err);
                            },
                            {}
                        )
                    }
                },
        ];

        this.ballotOptions = [
            {
                label: 'Ballot Overview',
                icon: 'pi pi-align-justify',
                command: (e) => {
                }
            }
        ]
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.slug}/rounds`,
            `GET`,
            (respData) => {
                if (respData.tournament.Rounds) {
                    respData.tournament.Rounds.forEach(round => {
                            this.roundOptions.push({
                                label: round.title,
                                icon: `pi pi-${round.completed ? 'check' : 'spinner pi-spin'}`,
                                command: () => {
                                    window.location.pathname = `/tournament/${this.props.slug}/round/${round.id}`;
                                }
                            });

                            this.ballotOptions.push({
                                label: `${round.title} - Results`,
                                icon: `pi pi-${round.completed ? 'check' : 'spinner pi-spin'}`,
                                command: () => {
                                    window.location.pathname = `/tournament/${this.props.slug}/ballots/${round.id}`;
                                }
                            });
                    }

                    )
                }
            },
            (err) => {
                console.log(err);
            }
        );

        ttlib.api.requestAPI(
            `/tournaments/${this.props.slug}/public`,
            `GET`,
            (respData) => {
                this.setState({
                    TournamentRoles: respData.tournament.TournamentRoles
                })
            },
            (err) => {}
        )
    }

    render() {
        const alignLeft = (
            <React.Fragment>
                <SplitButton id="teams" model={this.splitOptionsTeams} onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/teams`} label="Teams" icon="pi pi-users" className="p-mr-2 p-button-info" />
                <SplitButton id="adjudicators" model={this.splitOptionsAdjudicators} onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/adjudicators`} label="Adjudicators" icon="pi pi-user" className="p-mr-2 p-button-info" />
                <SplitButton id="venues" model={this.splitOptionsVenues} onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/venues`} label="Venues" icon="pi pi-home" className="p-mr-2 p-button-info" />
                <SplitButton id="rounds" model={this.roundOptions} label="Rounds" icon="pi pi-briefcase" className="p-mr-2 p-button-help" />
                <SplitButton id="ballots" model={this.ballotOptions} label="Ballots" icon="pi pi-file" className="p-mr-2 p-button-help" />
            </React.Fragment>
        );

        const alignRight = (
            <React.Fragment>
                <a href={`/tournament/${this.state.slug}/config`}><Button label="Configuration" icon="pi pi-cog" className="p-mr-2 p-button-secondary" /></a>
                <Button label="Hide" icon="pi pi-window-minimize" className="p-mr-2 p-button-danger" onClick={() => this.setState({collapsed: true})}/>
            </React.Fragment>
        );

        const shouldShowBar = (roles, user) => {
            if (!user || !this.props.loggedIn) {
                return false;
            }

            const tr = roles.find(tr => tr.AccountId === user.Person.AccountId);
            return !!tr;

        }

        return (
            shouldShowBar(this.state.TournamentRoles, this.props.user) ?
                this.state.collapsed ?
                    <div className="text-center">
                        <Button label="Show Toolbar" icon="pi pi-window-maximize" className="p-mr-2 p-mb-1 p-button-success" onClick={() => this.setState({collapsed: false})}/>
                    </div>
                    :
                    <Toolbar className="mb-1" left={alignLeft} right={alignRight} />
            : ""
        )
    }
}

export default TournamentToolBar;