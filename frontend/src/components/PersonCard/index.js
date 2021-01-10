import React from "react";
import {Card} from "primereact/card";

class PersonCard extends React.Component {

    render() {
        const header = <div className="w-100">
            <div className="profile-pic-display image-center text-center">
                <img alt="Card" className="text-center" src={this.props.img}/>
            </div>
        </div>;
        return (
            <Card header={header} title={this.props.name} className="text-center person-card p-ml-2 p-mt-4" style={{width: "200px"}}>
                <i>
                    {this.props.description}
                </i>
            </Card>
        );
    }
}

export default PersonCard;