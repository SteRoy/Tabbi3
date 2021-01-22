import React from 'react';
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import CreateInstitutionPage from "../CreateInstitutionPage";
import {Chip} from "primereact/chip";
import CreateInstitutionAliasPage from "../CreateInstitutionAliasPage";
const ttlib = require("ttlib");

class InstitutionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            institutions: [],
            institutionsWithMembers: [],
            createShow: false,
            addAliasShow: false
        }
    }

    componentWillMount() {
        ttlib.api.requestAPI(
            `/institutions`,
            `get`,
            (respData) => {
                this.setState({
                    ...respData
                })
            },
            (errorMessage) => {}
            )
    }

    render() {
        const members = (row) => {
            const obj = this.state.institutionsWithMembers.find(i => i.InstitutionId === row.id);
            if (obj) {
                return <span>{obj.Members}</span>
            } else {
                return <span>0</span>
            }
        }

        const aliases = (row) => {
            if (row.InstitutionAliases) {
                return (
                    <span>
                        {row.InstitutionAliases.map(aliasObj => (
                            <Chip label={aliasObj.alias} className="p-mr-1 p-mt-1"/>
                        ))}
                    </span>
                )
            }
        }

        return(
            <div>
                <NavBar active="institutions" userCB={(user, loggedIn) => this.setState({user, loggedIn})}/>
                <Dialog header="Create New Institution" visible={this.state.createShow} style={{ width: '50vw' }} onHide={() => this.setState({createShow: false})}>
                    <CreateInstitutionPage
                        onSuccess={() => this.setState({createShow: false})}
                    />
                </Dialog>
                <Dialog header="Add Institution Alias" visible={this.state.addAliasShow} style={{ width: '50vw' }} onHide={() => this.setState({addAliasShow: false})}>
                    <CreateInstitutionAliasPage
                        onSuccess={() => this.setState({addAliasShow: false})}
                    />
                </Dialog>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <Card>
                            <div className="display-4 text-center">Institutions</div>
                            {
                                <div className="w-100 text-left">
                                    <Button label="New" icon="pi pi-plus" className="p-button-success" onClick={() => this.setState({createShow: true})}/>
                                    <Button label="Add Alias" icon="pi pi-plus" className="p-button-primary p-ml-2" onClick={() => this.setState({addAliasShow: true})}/>
                                </div>
                            }
                            <hr/>
                            <DataTable
                                value={this.state.institutions}
                                paginator
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} institutions" rows={10} rowsPerPageOptions={[10,20,50]}
                            >
                                <Column field="name" header="Institution Name"/>
                                <Column body={members} header="Number of Members"/>
                                <Column body={aliases} header="Aliases"/>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default InstitutionList