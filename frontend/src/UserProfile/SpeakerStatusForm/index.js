import React from 'react';
import { Button } from 'primereact/button';
import InputBox from "../../components/InputBox";
import NavBar from "../../NavBar";
import {Toast} from "primereact/toast";
const ttlib = require("ttlib");

class SpeakerStatusForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "",
            errors: {}
        }

        this.fields = [
            {
                id: "type",
                type: "dropdown",
                options: () => [{value: "ESL", label: "ESL"}, {value: "EFL", label: "EFL"}, {value: "Novice", label: "Novice"}],
                tooltip: `The speaker status you wish to add to your account.`
            }
        ];

        this.submit = this.submit.bind(this);
    }

    submit(event) {
        event.preventDefault();
        ttlib.validation.objContainsFields(this.state, ["type"]).then(postForm => {
            ttlib.api.requestAPI(
                `/people/me/languagestatuses`,
                'POST',
                (respData) => {
                    ttlib.component.toastSuccess(this.toast, "Speaker Status Added", "Your status has been updated");
                    this.props.onSuccess(respData);
                },
                (errorMessage) => {
                    ttlib.component.toastError(this.toast, "Failed to add speaker status", errorMessage);
                },
                {
                    type: postForm.type,
                    delete: false
                }
            )
        }).catch(missingField => {
            this.setState({
                errors: {
                    [missingField]: `You must complete this field`
                }
            })
        })
    }

    render() {
        return(
            <div>
                <Toast ref={(ref) => this.toast = ref}/>
                <form onSubmit={this.submit}>
                    {
                        this.fields.map(field => (
                            <InputBox
                                id={field.id}
                                value={this.state[field.id]}
                                cb={(dict) => this.setState(dict)}
                                errors={this.state.errors}
                                type={field.type}
                                label={field.label}
                                options={field.options}
                            />
                        ))
                    }
                    <Button label="Save" className="btn btn-success btn-block mt-2"/>
                </form>
            </div>
        )
    }
}

export default SpeakerStatusForm;