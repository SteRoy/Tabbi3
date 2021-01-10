import React from "react";
import {Card} from "primereact/card";

class TournamentCard extends React.Component {

    render() {
        const header = <img alt="Card" src='https://scontent.fdsa1-1.fna.fbcdn.net/v/t1.0-9/s960x960/118215732_448142762751434_3584822132726396335_o.jpg?_nc_cat=101&ccb=2&_nc_sid=340051&_nc_ohc=ICKy43wgZQoAX9g9p8F&_nc_ht=scontent.fdsa1-1.fna&tp=7&oh=c2807d21f734b569ae39ce06cf112855&oe=601FF2B9'/>;
        return (
            <Card header={header} title={this.props.title}>
                {this.props.description}
            </Card>
        );
    }
}

export default TournamentCard;