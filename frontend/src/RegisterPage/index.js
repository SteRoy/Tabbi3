import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import { Button } from 'primereact/button';
import InputBox from "../components/InputBox";

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            password: "",
            confirmpassword: "",
            errors: {}
        }

        this.fields = [
            {id: "name"},
            {id: "email"},
            {id: "password", type: "password"},
            {id: "confirmpassword", label: "Confirm Password", type: "password"}
        ]

        this.register = this.register.bind(this);
    }

    register() {
        let validation = true;
        let errors = {};
        // This should probably be refactored to be more dynamic.
        ["name", "email", "password", "confirmpassword"].forEach(field => {
            if (!this.state[field]) {
                errors[field] = "This field is required.";
                validation = false;
            }
        });

        if (validation) {
            // Login Post Request
        } else {
            this.setState({
                errors
            })
        }

    }

    render() {
        return (
            <div>
                <NavBar active="register"/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-4">
                        <Card>
                            <span className="display-4 text-center">Register</span>
                            <hr/>

                            <form onSubmit={this.register}>
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
                            </form>

                            <Button label="Register" className="p-button-raised p-button-success p-mt-4" onClick={this.register} />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegisterPage;