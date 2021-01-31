import React from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {confirmDialog} from "primereact/components/confirmdialog/ConfirmDialog";
const ttlib = require("ttlib");

class RoundToolBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const confirm = () => {
            confirmDialog({
                message: 'Are you sure you want to generate the draw? This will erase any current debates, results etc.',
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    ttlib.api.requestAPI(
                        `/tournaments/${this.props.slug}/round/${this.props.roundID}/draw`,
                        `POST`,
                        () => {
                            ttlib.component.toastSuccess(this.props.toast, "Draw Generated", `This round's debates have been generated.`);
                        },
                        (err) => {
                            ttlib.component.toastError(this.props.toast, "Draw Not Generated", `${err}`);
                        },
                        {}
                    )
                },
                reject: () => {}
            });
        }

        const alignLeft = (
            <React.Fragment>
                <a href={`./${this.props.roundID}/allocate`}><Button label="Allocations" icon="pi pi-directions" className="p-mr-2 p-button-help" /></a>
                <Button label="Motion" icon="pi pi-plus" className="p-mr-2 p-button-help" onClick={this.props.motionCB} />
                <a href={`./${this.props.roundID}/displayDraw`}><Button label="Draw Display" icon="pi pi-desktop" className="p-mr-2 p-button-secondary" /></a>
                <Button onClick={confirm} label="Generate Draw" icon="pi pi-compass" className="p-mr-2 p-button-danger" />
            </React.Fragment>
        );

        const alignRight = (
            <React.Fragment>
                <a href={`./${this.props.roundID}/config`}><Button label="Round Settings" icon="pi pi-cog" className="p-mr-2 p-button-secondary" /></a>
            </React.Fragment>
        );

        return (
            <Toolbar className="mb-1" left={alignLeft} right={alignRight} />
        )
    }
}

export default RoundToolBar;