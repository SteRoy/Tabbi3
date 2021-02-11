import React from "react";
import { Card } from 'primereact/card';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Redirect} from "react-router-dom";
import NavBar from "../../NavBar";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Knob} from "primereact/knob";
import {Toast} from "primereact/toast";
import {Button} from "primereact/button";
const ttlib = require("ttlib");

class ManagePreRegistrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            preregistrations: []
        }

        this.metrics = [
            {id: "count", title: `No. ${ttlib.string.toTitleCase(this.props.match.params.type)} Preregistrations`, calc: (prereg) => prereg.length},
        ]
        if (!["adjudicator", "team"].includes(this.props.match.params.type)) {
            this.state.error = "You must use a valid model.";
        }

        this.fields = props.match.params.type === "team" ? [
            {key: "registrant.name", header: "Speaker 1"},
            {key: "speakerTwo.name", header: "Speaker 2"},
            {key: "teamName", header: "Team Name"}
        ]
            :
            [
                {key: "registrant", header: "Adjudicator Name"}
            ]

        this.setPreregistrationStatus = this.setPreregistrationStatus.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/preregistration/${this.props.match.params.slug}/${this.props.match.params.type}`,
            'GET',
            (respData) => {
                this.setState({
                    preregistrations: respData.tournament.Preregistrations,
                    tournament: respData.tournament
                })
            },
            (err) => {
                ttlib.component.toastError(this.toast, `Fetch Error`, err);
            }
        )
    }

    setPreregistrationStatus(preregistrationId, decision) {
        let preregistrations = this.state.preregistrations.filter(p => p.id !== preregistrationId);
        this.setState({preregistrations});
        ttlib.api.requestAPI(
            `/preregistration/application/${this.state.tournament.slug}/${preregistrationId}/${decision}`,
            `POST`,
            (respData) => {
                ttlib.component.toastSuccess(this.toast, `Preregistration Updated`, respData.success);
            },
            (err) => {
                ttlib.component.toastError(this.toast, `Preregistration NOT Updated`, err);
            }
        )
    }

    render() {

        const approveBody = (prereg) => {
            return <Button label="Approve" icon="pi pi-fw pi-check" className="p-button-success" onClick={() => this.setPreregistrationStatus(prereg.id, 'accept')}/>
        }

        const rejectBody = (prereg) => {
            return <Button label="Reject" icon="pi pi-fw pi-check" className="p-button-danger" onClick={() => this.setPreregistrationStatus(prereg.id, 'reject')}/>
        }

        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                {this.state.selected ? <Redirect to={`/tournament/${this.props.match.params.slug}/adjudicators/${this.state.selected.id}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/>
                        {
                            this.state.error ?
                                <div className="alert alert-danger">
                                    {this.state.error}
                                </div>
                                :
                                    <Card>
                                        <div className="display-4 text-center">{ttlib.string.toTitleCase(this.props.match.params.type)} Preregistration</div>
                                        <div className="p-grid p-justify-between">
                                            {
                                                this.state.preregistrations.length > 0 ?
                                                    this.metrics.map(metric => (
                                                        <div className="p-col-12 p-md-12 p-text-center" key={metric.id}>
                                                            <h5 className="p-mt-3">{metric.title}</h5>
                                                            <Knob
                                                                value={metric.calc(this.state.preregistrations)}
                                                            />
                                                        </div>
                                                    ))
                                                    : ""
                                            }
                                        </div>
                                    <hr/>
                                    <DataTable
                                        value={this.state.preregistrations}
                                        paginator
                                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} preregistrations" rows={10} rowsPerPageOptions={[10,20,50]}
                                        selection={this.state.selected}
                                        onSelectionChange={e => {}}
                                        selectionMode="single"
                                        sortField="name"
                                        sortOrder={-1}
                                        dataKey="id"
                                    >
                                        <Column field="reference" header="Reference" sortable filter filterPlaceholder="Search by ref" filterMatchMode="contains"/>
                                        {
                                            this.fields.map(field => (
                                                <Column field={field.key} header={field.header} sortable filter filterPlaceholder="Search" filterMatchMode="contains"/>
                                            ))
                                        }
                                        <Column body={approveBody} header="Approve"/>
                                        <Column body={rejectBody} header="Reject"/>
                                    </DataTable>
                            </Card>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default ManagePreRegistrationPage;