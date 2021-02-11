import React from "react";
import {Card} from "primereact/card";

class TournamentCard extends React.Component {

    render() {
        const header = <img alt="Card" src='https://i.imgur.com/lEz7fNG.jpg'/>;
        return (
            <Card header={header} title={this.props.title}>
                {this.props.description}
            </Card>
        );
    }
}

export default TournamentCard;