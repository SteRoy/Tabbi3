import React from 'react';
import InputBox from "../../components/InputBox";
const ttlib = require("ttlib");

class InstitutionMembershipForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedInstitution: null,
            startDate: "",
            endDate: "",
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
            {id: "startDate", type: "date", label: "Start Date", time: false},
            {id: "endDate", type: "date", label: "End Date", time: false}
        ];

        this.submit = this.submit.bind(this);
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

    submit() {
        ttlib.validation.objContainsFields(this.state, ["selectedInstitution", "startDate", "endDate"]).then(postForm => {
            ttlib.api.requestAPI(
                `/people/me/institutions`,
                'POST',
                (respData) => {
                    this.props.onSuccess(respData);
                },
                (errorMessage) => {},
                {
                    institution: postForm.selectedInstitution.id,
                    startDate: postForm.startDate,
                    endDate: postForm.endDate
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
                            time={field.time}
                        />
                    ))
                }
                <br/>
                <button onClick={this.submit} className="btn btn-success btn-block mt-2">Save</button>
            </div>
        )
    }
}

export default InstitutionMembershipForm;