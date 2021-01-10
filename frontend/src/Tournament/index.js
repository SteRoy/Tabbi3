import React from "react";
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import TournamentHome from "./TournamentHome";

// Page Imports

class TournamentRouter extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/" component={TournamentHome}/>
                </Switch>
            </Router>
        )
    }
}

export default TournamentRouter;