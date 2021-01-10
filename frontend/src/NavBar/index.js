import React from 'react';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
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
                id: "login"
            },
            {
                label: "Register",
                href: "/register",
                id: "register"
            }
        ]
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
                                return (
                                    <li className={`nav-item ${this.props.active === entry.id ? "active" : ""}`}>
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