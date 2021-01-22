import React from 'react';
import InputBox from "../../components/InputBox";
import NavBar from "../../NavBar";
import {Toast} from "primereact/toast";
const ttlib = require("ttlib");

class PersonalClashForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTarget: null,
            type: "",
            people: [],
            errors: {}
        }

        this.fields = [
            {
                id: "selectedTarget",
                type: "person",
                label: "Person to Clash",
                options: () => this.state.people
            },
            {id: "type", type: "dropdown", options: () => [{value: "soft", label: "Soft"}, {value: "hard", label: "Hard"}]}
        ];

        this.submit = this.submit.bind(this);
    }

    componentWillMount() {
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

    submit() {
        ttlib.validation.objContainsFields(this.state, ["selectedTarget", "type"]).then(postForm => {
            if (!this.state.selectedTarget.length === 1) {
                this.setState({
                    errors: {
                        selectedTarget: "You must select a target"
                    }
                })
                return;
            }
            ttlib.api.requestAPI(
                `/people/me/clash`,
                'POST',
                (respData) => {
                    ttlib.component.toastSuccess(this.toast, "Clash Added", "Your clash has been added");
                    this.props.onSuccess(respData);
                },
                (errorMessage) => {
                    ttlib.component.toastError(this.toast, "Failed to add clash", errorMessage);
                },
                {
                    target: postForm.selectedTarget[0].id,
                    type: postForm.type
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
                {
                    this.state.type ?
                        <div className="alert alert-info">
                            {
                                this.state.type === "soft" ?
                                    <p>Soft Clash is clash which can be violated strictly when necessary to produce a draw with you in it and may be pre-emptively displayed when the adjudication core are producing the draw.</p>
                                    :
                                    <p>Hard Clash is the most severe form of clash and will not be revealed in a draw's generation unless it is violated. You would rather not take part in the round than face a situation where your hard clash cannot be violated.</p>
                            }
                        </div>
                        : ""
                }
                <br/>
                <button onClick={this.submit} className="btn btn-success btn-block mt-2">Save</button>
            </div>
        )
    }
}

export default PersonalClashForm;