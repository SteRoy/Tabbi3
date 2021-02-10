import React from "react";
import {Card} from "primereact/card";

class TournamentCard extends React.Component {

    render() {
        const header = <img alt="Card" src=''/>;
        return (
            <Card header={header} title={this.props.title}>
                {this.props.description}
            </Card>
        );
    }
}

export default TournamentCard;