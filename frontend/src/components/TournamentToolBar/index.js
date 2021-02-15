import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {SplitButton} from 'primereact/splitbutton';
import { Sidebar } from 'primereact/sidebar';
import * as ttlib from "ttlib";
import {Divider} from "primereact/divider";

class TournamentToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
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

            if (objType === "adjudicators") {
                options.push(
                    {
                        label: 'Assign Test Scores',
                        icon: 'pi pi-sliders-h',
                        command: (e) => {
                            window.location.pathname = `/tournament/${this.props.slug}/adjudicators/testscores`;
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



        this.shouldShowBar = this.shouldShowBar.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.slug}/rounds`,
            `GET`,
            (respData) => {
                if (respData.tournament.Rounds) {
                    respData.tournament.Rounds.sort((a,b) => a.sequence < b.sequence ? -1 : 1).forEach(round => {
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

        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("mousedown", this.handleClick);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("mousedown", this.handleClick);
    }

    handleKeyDown(event) {
        if (!event.isComposing) {
            if (event.altKey) {
                switch (event.keyCode) {
                    // ESCAPE
                    case 88:
                        this.setState({collapsed: false});
                        break;
                    default:
                        break;
                }
            } else {
                switch (event.keyCode) {
                    // ESCAPE
                    case 27:
                        this.setState({collapsed: true});
                        break;
                    default:
                        break;
                }
            }
        }
    }

    handleClick(event) {
        if (this.sidebar) {
            if (!this.sidebar.contains(event.target)) {
                this.setState({
                    collapsed: true
                })
            }
        }
    }

    shouldShowBar(roles, user) {
        if (!user || !this.props.loggedIn) {
            return false;
        }

        const tr = roles.find(tr => tr.AccountId === user.Person.AccountId);
        return !!tr;

    }

    render() {

        return (
            <span>
                <span ref={ref => this.sidebar = ref}>
                        <Sidebar
                            visible={!this.state.collapsed}
                            onHide={() => this.setState({collapsed: true})}
                            style={{'z-index': '10000'}}
                            dismissable={true}
                        >
                            <div className="display-5 text-center">
                                Toolbar
                            </div>
                            <hr/>
                            <div>
                                <Button
                                    id="t-home"
                                    onClick={() => window.location.pathname = `/tournament/${this.state.slug}`}
                                    label="Tournament Home"
                                    icon="pi pi-home"
                                    className="p-mr-2 p-button-success w-100 p-mb-1" />
                            </div>
                            <Divider align="center">
                                <span>Model Tools</span>
                            </Divider>
                            <div>
                                <SplitButton
                                    id="teams"
                                    model={this.splitOptionsTeams}
                                    onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/teams`}
                                    label="Teams"
                                    icon="pi pi-users"
                                    className="p-mr-2 p-button-info w-100 p-mb-1" />
                            </div>
                            <div>
                                <SplitButton
                                    id="adjudicators"
                                    model={this.splitOptionsAdjudicators}
                                    onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/adjudicators`}
                                    label="Adjudicators"
                                    icon="pi pi-user"
                                    className="p-mr-2 p-button-info w-100 p-mb-1" />
                            </div>
                            <div>
                                <SplitButton
                                    id="venues"
                                    model={this.splitOptionsVenues}
                                    onClick={() => window.location.pathname = `/tournament/${this.state.slug}/list/venues`}
                                    label="Venues"
                                    icon="pi pi-home"
                                    className="p-mr-2 p-button-info w-100 p-mb-1"
                                />
                            </div>
                            <Divider align="center">
                                <span>Round Tools</span>
                            </Divider>
                            <div>
                                <SplitButton
                                    id="rounds"
                                    model={this.roundOptions}
                                    label="Rounds"
                                    icon="pi pi-briefcase"
                                    className="p-mr-2 p-button-help w-100 p-mb-1" />
                            </div>
                            <div>
                                <SplitButton
                                    id="ballots"
                                    model={this.ballotOptions}
                                    label="Ballots"
                                    icon="pi pi-file"
                                    className="p-mr-2 p-button-help w-100 p-mb-1" />
                            </div>
                            <Divider align="center">
                                <span>Tournament Tools</span>
                            </Divider>
                            <div>
                                <a href={`/tournament/${this.state.slug}/config`}>
                                    <Button
                                        label="Tournament Configuration"
                                        icon="pi pi-cog"
                                        className="p-mr-2 p-button-secondary w-100 p-mb-1"
                                    />
                                </a>
                            </div>
                            <hr/>
                            <div>
                                <Button
                                    label="Hide (Esc)"
                                    icon="pi pi-window-minimize"
                                    className="p-mr-2 p-button-danger w-100 p-mb-1"
                                    onClick={() => this.setState({collapsed: true})}
                                />
                            </div>
                            <div className="text-center">
                                <small>
                                    You can close this toolbar by pressing 'Escape'.
                                </small>
                            </div>
                        </Sidebar>
                    </span>
                {this.shouldShowBar(this.state.TournamentRoles, this.props.user) ?
                        <div className="text-left">
                            <Button
                                label="Show Tournament Toolbar (ALT+X)"
                                icon="pi pi-window-maximize"
                                className="p-mr-2 p-mb-1 p-button-success w-100"
                                onClick={() => this.setState({collapsed: false})}/>
                        </div>
                    : ""
                }
            </span>
        )
    }
}

export default TournamentToolBar;