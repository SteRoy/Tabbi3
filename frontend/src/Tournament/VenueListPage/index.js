import React from "react";
import { Card } from 'primereact/card';
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Redirect} from "react-router-dom";
import NavBar from "../../NavBar";
import {Tag} from "primereact/tag";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Knob} from "primereact/knob";
import {Toast} from "primereact/toast";
const ttlib = require("ttlib");

class VenueListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            venues: []
        }

        this.metrics = [
            {id: "count", title: "No. Venues", calc: (venues) => venues.length},
            {id: "countActive", title: "No. Active Venues", calc: (venues) => venues.filter(v => v.active).length}
        ]
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/venues`,
            'GET',
            (venuesData) => {
                this.setState({...venuesData})
            },
            () => {}
        )
    }

    render() {

        const rowBodyTemplate = (row) => {
            return {
                'bg-placeholder': row.placeholder
            }
        }

        const activeField = (row) => {
            return row.active ? <span className="pi pi-check text-success"/> : <span className="pi pi-times text-danger"/>;
        }

        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/>
                        <Card>
                            <div className="display-4 text-center">Tournament Venues</div>
                            <div className="p-grid p-justify-between">
                                {
                                    this.state.venues.length > 0 ?
                                        this.metrics.map(metric => (
                                            <div className="p-col-12 p-md-6 p-text-center" key={metric.id}>
                                                <h5 className="p-mt-3">{metric.title}</h5>
                                                <Knob
                                                    value={metric.calc(this.state.venues)}
                                                />
                                            </div>
                                        ))
                                    : ""
                                }
                            </div>
                            <hr/>
                            <DataTable
                                value={this.state.venues}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} venues" rows={10} rowsPerPageOptions={[10,20,50]}
                                selection={this.state.selected}
                                onSelectionChange={e => {
                                      ttlib.api.requestAPI(
                                          `/tournaments/${this.props.match.params.slug}/venues/${e.value.id}/active`,
                                          `POST`,
                                          (respData) => {
                                              let venues = this.state.venues;
                                              venues.forEach(v => {
                                                  if (v.id === e.value.id) {
                                                      v.active = !v.active;
                                                  }
                                              });
                                              this.setState({
                                                  venues
                                              });
                                              ttlib.component.toastSuccess(this.toast, "Venue Status Updated", "The venue's active status has been toggled.");
                                          },
                                          (err) => {
                                              ttlib.component.toastError(this.toast, "Venue Update Failed", `The venue's active status has not been toggled: ${err}`);
                                          },
                                          {}
                                      )
                                    }
                                }
                                selectionMode="single"
                                sortField="name"
                                sortOrder={-1}
                                dataKey="id"
                                rowClassName={rowBodyTemplate}
                            >
                                <Column field="name" header="Venue Name" sortable filter filterPlaceholder="Search by name" filterMatchMode="contains"/>
                                <Column body={activeField} header="Active" sortable/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default VenueListPage;