import React from "react";
import {Route} from 'react-router-dom';

// Page Imports
import TournamentHome from "./TournamentHome";
import RoundViewPage from "./RoundViewPage";
import AllocationPage from "./AllocationPage";

class TournamentRouter extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Route exact path="/tournament/:slug" component={TournamentHome}/>
                <Route exact path="/tournament/:slug/round" component={RoundViewPage}/>
                <Route exact path="/tournament/:slug/round/:rid/allocate" component={AllocationPage}/>
            </React.Fragment>
        )
    }
}

export default TournamentRouter;