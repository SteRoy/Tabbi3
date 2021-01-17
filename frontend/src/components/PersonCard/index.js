import React from "react";
import {Chip} from "primereact/chip";

class PersonCard extends React.Component {

    render() {
        return (
            <Chip
                label={this.props.name}
                image={this.props.img}
                icon="pi pi-user"
                className="p-mr-2 p-mt-3"
            />
        );
    }
}

export default PersonCard;