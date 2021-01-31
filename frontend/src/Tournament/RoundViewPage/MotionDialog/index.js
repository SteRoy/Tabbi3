import React from 'react';
import {Dialog} from "primereact/dialog";
import InputBox from "../../../components/InputBox";
const ttlib = require("ttlib");

class MotionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            motion: props.round.motion,
            infoslide: props.round.infoslide,
            errors: {}
        }


        this.fields = [
            {id: "motion", label: "Motion", type: "textarea", required: true},
            {id: "infoslide", label: "Info Slide", type: "textarea", required: false}
        ];

        this.submit = this.submit.bind(this);
    }

    submit() {
        ttlib.validation.objContainsFields(this.state, ['motion']).then(() => {
            let postForm = {
                motion: this.state.motion
            };
            if (this.state.infoslide) {
                postForm.infoslide = this.state.infoslide;
            }
            ttlib.api.requestAPI(
                `/tournaments/${this.props.slug}/round/${this.props.round.id}/motion`,
                `POST`,
                () => {
                    ttlib.component.toastSuccess(this.props.toast, "Motion Updated", `The motion has been updated.`);
                },
                (errorMessage) => {
                    ttlib.component.toastSuccess(this.props.toast, "Motion Update Failed", `The motion could not be updated: ${errorMessage}`);
                },
                postForm
            )
        }).catch(missing => {
            this.setState({
                errors: {
                    [missing]: `You must complete this field`
                }
            })
        })
    }

    render() {
        return(
            <Dialog header={`${this.props.round.title} - Motion & Info Slide`} visible={this.props.visible} onHide={this.props.hide}>
                {
                    this.fields.map(field => (
                        <InputBox
                            id={field.id}
                            label={field.label}
                            cb={(dict) => this.setState(dict)}
                            value={this.state[field.id]}
                            type={field.type || "text"}
                            errors={this.state.errors}
                        />
                    ))
                }
                <button className="btn btn-block btn-success"
                        onClick={() => {
                                this.submit();
                                this.props.hide();
                            }
                        }>
                    Save
                </button>
            </Dialog>
        )
    }

}

export default MotionDialog;