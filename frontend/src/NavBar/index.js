import React from 'react';
const ttlib = require("ttlib");

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        };
        this.items = [
            {
                label: "Home",
                href: "/",
                id: "home"
            },
            {
                label: "Tournaments",
                href: "/tournaments",
                id: "tournaments"
            },
            {
                label: "Login",
                href: "/login",
                id: "login",
                condition: () => !this.state.loggedIn && this.state.account
            },
            {
                label: "Register",
                href: "/register",
                id: "register",
                condition: () => !this.state.loggedIn && this.state.account
            },
            {
                label: "Logout",
                href: "/logout",
                id: "logout",
                condition: () => this.state.loggedIn && this.state.account
            }
        ]
    }

    componentDidMount() {
        ttlib.api.requestAPI(`/accounts/me`, "GET", (data) => {
            this.setState({
                account: data.account,
                loggedIn: true
            })
        }, () => {
            this.setState({
                account: {}
            })
        })
    }

    render() {
        return(
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="/">Tabbi3</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        {
                            this.items.map(entry => {
                                if (Object.keys(entry).includes('condition')) {
                                    if (!entry.condition()) {
                                        return "";
                                    }
                                }
                                return (
                                    <li key={entry.id}
                                        className={`nav-item ${this.props.active === entry.id ? "active" : ""}`}>
                                        <a className={`nav-link`} href={entry.href}>{entry.label}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <form className="form-inline my-2 my-lg-0">
                        <input className="form-control mr-sm-2" type="search" placeholder="Tournament Search"/>
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                    </form>
                </div>
            </nav>
        )
    }
}

export default NavBar;