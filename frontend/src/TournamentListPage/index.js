import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

class TournamentListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tournaments: [
                {
                    name: "Doxbridge Worlds 2021",
                    logo: "https://scontent.fdsa1-1.fna.fbcdn.net/v/t1.0-9/s960x960/118215732_448142762751434_3584822132726396335_o.jpg?_nc_cat=101&ccb=2&_nc_sid=340051&_nc_ohc=ICKy43wgZQoAX9g9p8F&_nc_ht=scontent.fdsa1-1.fna&tp=7&oh=c2807d21f734b569ae39ce06cf112855&oe=601FF2B9",
                    institution: "Doxbridge Debating",
                    tab: "Steven Roy, Edmund Ross",
                    adj: "Jess Musulin"
                }
            ]
        }
    }

    render() {

        const tournamentLogoBody = (tournament) => {
            return <img alt={tournament.name} src={tournament.logo} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} className="datatable-tournament-logo" />;
        }

        return (
            <div>
                <NavBar active="tournaments"/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <Card>
                            <div className="display-4 text-center">All Tournaments</div>
                            <hr/>
                            <DataTable
                                value={this.state.tournaments}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tournaments" rows={10} rowsPerPageOptions={[10,20,50]}
                            >
                                <Column field="name" header="Tournament Name"/>
                                <Column header="Logo" body={tournamentLogoBody}/>
                                <Column field="institution" header="Hosted By"/>
                                <Column field="tab" header="Tab Team"/>
                                <Column field="adj" header="Adj Core"/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default TournamentListPage;