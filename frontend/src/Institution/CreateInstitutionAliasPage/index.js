import React from 'react';
import { Button } from 'primereact/button';
import InputBox from "../../components/InputBox";
import InstitutionSelector from "../../components/InstitutionSelector";
const ttlib = require("ttlib");

class CreateInstitutionAliasPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedInstitution: null,
            alias: "",
            institutions: [],
            errors: {}
        }
        this.fields = [
            {
                id: "selectedInstitution",
                type: "institution",
                label: "Institution",
                options: () => this.state.institutions.map(i => ({...i, aliasFilter: i.InstitutionAliases.map(a => a.alias).join(", ")}))
            },
            {id: "alias", type: "text", label: "Alias"}
        ];

        this.save = this.save.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/institutions/options`,
            'GET',
            (respData) => {
                this.setState(respData)
            },
            (errorMessage) => {}
        )
    }

    save(event) {
        event.preventDefault();
        ttlib.validation.objContainsFields(this.state, ["selectedInstitution", "alias"]).then(form => {
            ttlib.api.requestAPI(
                `/institutions/${form.selectedInstitution.id}/alias`,
                `POST`,
                (respData) => {
                    this.props.onSuccess();
                },
                (errorMessage) => {},
                {
                    alias: form.alias
                }
            );
        }).catch(missingField => {
            this.setState({
                errors: {
                    [missingField]: "You must fill this out."
                }
            })
        })

    }

    render() {
        return(
            <div>
                <form onSubmit={this.save}>
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
                        this.state.selectedInstitution ?
                            <div className="alert alert-warning mt-2">
                                Current Aliases for {this.state.selectedInstitution.name}:
                                {
                                    this.state.selectedInstitution.InstitutionAliases.length === 0 ? "None" : ""
                                }
                                <ul>
                                    {this.state.selectedInstitution.InstitutionAliases.map(aliasObj => (
                                        <li>{aliasObj.alias}</li>
                                    ))}
                                </ul>
                                <p>Before you add a new alias, please double check that it's not on this list already!</p>
                            </div>
                            : ""
                    }
                    <Button label="Save" className="btn btn-success btn-block mt-2" />
                </form>
            </div>
        );
    }
}

export default CreateInstitutionAliasPage