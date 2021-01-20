import React from 'react';
import { Redirect } from 'react-router-dom'
const ttlib = require("ttlib");

class LogoutPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedOut: false
        }
    }

    componentDidMount() {
        ttlib.api.requestAPI('/accounts/logout', 'post', () => {
            this.setState({
                loggedOut: true
            })
        }, () => {
            this.setState({
                loggedOut: true
            })
        }, {});
    }

    render() {
        return(this.state.loggedOut ? <Redirect to="/"/> : "")
    }
}

export default LogoutPage;