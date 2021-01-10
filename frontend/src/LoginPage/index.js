import React from "react";
import { Card } from 'primereact/card';
import NavBar from "../NavBar";
import { Button } from 'primereact/button';
import InputBox from "../components/InputBox";

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            errors: {}
        }

        this.login = this.login.bind(this);
    }

    login() {
        let validation = true;
        let errors = {};
        // This should probably be refactored to be more dynamic.
        ["username", "password"].forEach(field => {
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
                <NavBar active="login"/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-4">
                        <Card>
                            <span className="display-4 text-center">Login</span>
                            <hr/>

                            <form onSubmit={this.login}>
                                <InputBox
                                    id="username"
                                    cb={(dict) => this.setState(dict)}
                                    value={this.state.username}
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
                            </form>

                            <Button label="Login" className="p-button-raised p-button-success p-mt-4" onClick={this.login} />
                            <Button label="Forgot Password" className="p-button-raised p-button-secondary p-ml-4" />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;