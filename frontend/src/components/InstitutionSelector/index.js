import React from 'react';
import {Dropdown} from "primereact/dropdown";

class InstitutionSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Dropdown
                value={this.props.value}
                options={this.props.institutions}
                id={this.props.id}
                onChange={(e) => this.props.onSelect({[this.props.id]: e.value})}
                optionLabel="name"
                filter
                showClear
                filterBy="name,aliasFilter"
                placeholder="Select an Institution"
                className={"w-100 child-w-100"}
                appendTo={document.body}
            />
        )
    }
}

export default InstitutionSelector;