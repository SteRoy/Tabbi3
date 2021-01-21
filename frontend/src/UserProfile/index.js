import React from 'react';
import NavBar from "../NavBar";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import InputBox from "../components/InputBox";
import {Button} from "primereact/button";
import InstitutionMembershipForm from "./InstitutionMembershipForm";
import {Dialog} from "primereact/dialog";
import PersonalClashForm from "./PersonalClashForm";
import {Tag} from "primereact/tag";
const ttlib = require("ttlib");

class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            me: false,
            showInstitutionMemberForm: false,
            showPersonalClashForm: false,
            user: {Person: {}, InstitutionMemberships: []},
            clash: [],
            errors: {},
            people: []
        }

        this.details = [
            {id: "name", value: () => this.state.user ? this.state.user.Person.name || "" : "", type: "text", label: "Display Name", readOnly: true},
            {id: "email", value: () => this.state.user ? this.state.user.email : "",type: "text", label: "E-Mail", readOnly: true}
        ]
    }

    componentDidMount() {
        if (this.props.match.params.id === "me") {
            this.setState({
                me: true
            });

            ttlib.api.requestAPI(
                `/people`,
                `get`,
                (respData) => {
                    this.setState({
                        ...respData
                    })
                },
                (errorMessage) => {}
            )
        }


    }

    render() {
        const imInstitutionName = (row) => {
            return <span>{row.Institution.name}</span>
        }

        const personalClashName = (row) => {
            return <span>{this.state.people.find(p => p.id === row.targetAccountId).name}</span>
        }

        const personalClashDate = (row) => {
            return <span>{new Date(row.createdAt).toDateString()}</span>
        }

        const personalClashType = (row) => {
            if (row.type === "hard") {
                return <Tag severity="danger">Hard</Tag>
            } else {
                return <Tag severity="info">Soft</Tag>
            }
        }

        return(
            <div>
                <NavBar
                    active="home"
                    userCB={
                        (user, loggedIn, clash) => {
                            if (this.state.me) {
                                this.setState({user, loggedIn, clash})
                            }
                        }
                    }
                />
                <Dialog header="Add New Institution Membership" visible={this.state.showInstitutionMemberForm} style={{ width: '50vw' }} onHide={() => this.setState({showInstitutionMemberForm: false})}>
                    <InstitutionMembershipForm
                        onSuccess={() => this.setState({showInstitutionMemberForm: false})}
                    />
                </Dialog>
                <Dialog header="Add Personal Clash" visible={this.state.showPersonalClashForm} style={{ width: '50vw' }} onHide={() => this.setState({showPersonalClashForm: false})}>
                    <PersonalClashForm
                        onSuccess={() => this.setState({showPersonalClashForm: false})}
                    />
                </Dialog>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <Card>
                            <div className="display-4 text-center w-100">{this.state.me ? "Your" : ""} Profile</div>
                            <hr/>
                            <div className="p-grid">
                                <div className="p-xl-6 p-lg-6 p-md-6 p-sm-12 border-right">
                                    <div className="text-center display-5">Details</div>
                                    <hr/>
                                    {
                                        this.details.map(field => (
                                            <InputBox
                                                id={field.id}
                                                label={field.label}
                                                cb={(dict) => this.setState(dict)}
                                                value={field.value()}
                                                type={field.type || "text"}
                                                errors={this.state.errors}
                                                readOnly={field.readOnly}
                                            />
                                        ))
                                    }
                                    <div className="text-center display-5">Institutional Clashes</div>
                                    <hr/>
                                    <Button icon="pi pi-plus" label="Add" onClick={() => this.setState({showInstitutionMemberForm: true})} />
                                    <DataTable className="p-mt-2" value={this.state.user.Person.InstitutionMemberships}>
                                        <Column body={imInstitutionName} header="Institution"/>
                                        <Column field="startDate" header="Start Date"/>
                                        <Column field="endDate" header="End Date"/>
                                    </DataTable>
                                    <div className="text-center display-5">Personal Clashes</div>
                                    <hr/>
                                    <Button icon="pi pi-plus" label="Add" onClick={() => this.setState({showPersonalClashForm: true})}/>
                                    <DataTable className="p-mt-2" value={this.state.clash}>
                                        <Column body={personalClashName} header="Clash Target"/>
                                        <Column body={personalClashDate} header="Created"/>
                                        <Column body={personalClashType} field="type" header="Type"/>
                                    </DataTable>
                                </div>
                                <div className="p-xl-6 p-lg-6 p-md-6 p-sm-12">
                                    <div className="text-center display-5">Adjudicator CV</div>
                                    <hr/>
                                    <DataTable className="blur">
                                        <Column header="Tournament Name"/>
                                        <Column header="% Inround Chair"/>
                                        <Column header="Breaking Adjudicator"/>
                                    </DataTable>
                                    <div className="text-center display-5">Speaking CV</div>
                                    <hr/>
                                    <DataTable className="blur">
                                        <Column header="Tournament Name"/>
                                        <Column header="Team Name"/>
                                        <Column header="Team Ranking"/>
                                        <Column header="Speaker Points"/>
                                        <Column header="Speaker Ranking"/>
                                    </DataTable>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserProfile;