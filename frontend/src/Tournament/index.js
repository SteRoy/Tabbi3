import React from "react";
import {Route} from 'react-router-dom';

// Page Imports
import TournamentHome from "./TournamentHome";
import RoundViewPage from "./RoundViewPage";
import AllocationPage from "./AllocationPage";
import BallotPage from "./BallotPage";
import DrawPage from "./DrawPage";

class TournamentRouter extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Route exact path="/tournament/:slug" component={TournamentHome}/>
                <Route exact path="/tournament/:slug/round/:rid" component={RoundViewPage}/>
                <Route exact path="/tournament/:slug/round/:rid/allocate" component={AllocationPage}/>
                <Route exact path="/tournament/:slug/round/:rid/displayDraw" component={DrawPage}/>
                <Route exact path="/tournament/:slug/ballot/:ballotid" component={BallotPage}/>
            </React.Fragment>
        )
    }
}

export default TournamentRouter;