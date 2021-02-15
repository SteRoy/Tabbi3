import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import { Button } from 'primereact/button';
import InputBox from "../components/InputBox";
import {Toast} from "primereact/toast";
import { Redirect } from "react-router-dom";
const ttlib = require("ttlib");

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            errors: {},
            redirect: false
        }

        this.login = this.login.bind(this);
    }

    login(event) {
        event.preventDefault();
        let validation = true;
        let errors = {};
        // This should probably be refactored to be more dynamic.
        ["email", "password"].forEach(field => {
            if (!this.state[field]) {
                errors[field] = "This field is required.";
                validation = false;
            }
        });

        if (validation) {
            // Login Post Request
            ttlib.api.requestAPI(
                `/accounts/login`,
                "POST",
                () => {
                    ttlib.component.toastSuccess(this.toast, "Login Successful", "You have been successfully logged in.");
                    this.setState({
                        email: "",
                        password: "",
                        redirect: true
                    });
                },
                (errorMessage) => {
                    let error = errorMessage;
                    if (errorMessage === "Unauthorized") {
                        error = `Incorrect Credentials`;
                    }
                    ttlib.component.toastError(this.toast, "Login Failed", error);
                },
                {
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
                <NavBar active="login"/>
                <Toast ref={(ref) => this.toast = ref}/>
                {this.state.redirect ? <Redirect to="/"/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-10 p-md-8">
                        <Card>
                            <span className="display-4 text-center">Login</span>
                            <hr/>

                            <form onSubmit={this.login}>
                                <InputBox
                                    id="email"
                                    cb={(dict) => this.setState(dict)}
                                    value={this.state.email}
                                    type="text"
                                    errors={this.state.errors}
                                />

                                <InputBox
                                    id="password"
                                    cb={(dict) => this.setState(dict)}
                                    value={this.state.password}
                                    type="password"
                                    errors={this.state.errors}
                                />
                                <Button label="Login" className="p-button-raised p-button-success p-mt-4" type="submit" />
                                <Button label="Forgot Password" className="p-button-raised p-button-secondary p-ml-4" />
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;