import React from "react";
import {Route} from 'react-router-dom';

// Page Imports
import TournamentHome from "./TournamentHome";
import RoundViewPage from "./RoundViewPage";
import AllocationPage from "./AllocationPage";
import BallotPage from "./BallotPage";
import DrawPage from "./DrawPage";
import CreateTournamentPage from "./CreateTournamentPage";
import ConfigPage from "./ConfigPage";
import CreatePlaceholderModelPage from "./CreatePlaceholderModelPage";
import AdjudicatorListPage from "./AdjudicatorListPage";
import TeamListPage from "./TeamListPage";
import RoundConfigPage from "./RoundViewPage/RoundConfigPage";
import VenueListPage from "./VenueListPage";

class TournamentRouter extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Route exact path="/tournament/:slug" component={TournamentHome}/>
                <Route exact path="/tournament/:slug/config" component={ConfigPage}/>
                <Route exact path="/tournament/:slug/create/:model" component={CreatePlaceholderModelPage}/>
                <Route exact path="/tournament/:slug/list/adjudicators" component={AdjudicatorListPage}/>
                <Route exact path="/tournament/:slug/list/teams" component={TeamListPage}/>
                <Route exact path="/tournament/:slug/list/venues" component={VenueListPage}/>
                <Route exact path="/tournament/:slug/round/:rid" component={RoundViewPage}/>
                <Route exact path="/tournament/:slug/round/:rid/allocate" component={AllocationPage}/>
                <Route exact path="/tournament/:slug/round/:rid/config" component={RoundConfigPage}/>
                <Route exact path="/tournament/:slug/round/:rid/displayDraw" component={DrawPage}/>
                <Route exact path="/tournament/:slug/ballot/:ballotid" component={BallotPage}/>
            </React.Fragment>
        )
    }
}

export default TournamentRouter;