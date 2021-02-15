import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import { Button } from 'primereact/button';
import InputBox from "../components/InputBox";
import {Toast} from "primereact/toast";
const ttlib = require("ttlib");

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

    register(event) {
        event.preventDefault();
        let validation = true;
        let errors = {};
        // This should probably be refactored to be more dynamic.
        ["name", "email", "password", "confirmpassword"].forEach(field => {
            if (!this.state[field]) {
                errors[field] = "This field is required.";
                validation = false;
            }
        });

        if (this.state.password !== this.state.confirmpassword) {
            validation = false;
            errors["password"] = "Passwords must match.";
            errors["confirmpassword"] = "Passwords must match.";
        }

        if (validation) {
            // Login Post Request
            ttlib.api.requestAPI(
                `/accounts/create`,
                "POST",
                (response) => {
                    ttlib.component.toastSuccess(this.toast, "Registration Successful", "Your account has been created, you can now login.");
                    this.setState({
                        name: "",
                        email: "",
                        password: "",
                        confirmpassword: ""
                    });
                },
                (errorMessage) => {
                    ttlib.component.toastError(this.toast, "Registration Failed", errorMessage);
                },
                {
                    name: this.state.name,
                    email: this.state.email,
                    password: this.state.password
                });
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
                <Toast ref={(ref) => this.toast = ref}/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-10 p-md-8">
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
                                <Button label="Register" className="p-button-raised p-button-success p-mt-4" />
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegisterPage;