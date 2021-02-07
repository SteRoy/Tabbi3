import React from 'react';
import {AutoComplete} from "primereact/autocomplete";
import Fuse from 'fuse.js';

class PersonSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: []
        }
        this.fuseOptions = {
            keys: ['name'],
            includeScore: true
        }
    }

    render() {
        const searchPerson = (searchEvent) => {
            const fuse = new Fuse(this.props.options, this.fuseOptions);
            const results = fuse.search(searchEvent.query, {limit: 5}).map(i => i.item);
            this.setState({
                suggestions: results
            });
        }

        const templateList = (row) => {
            return <span>{row.name}</span>
        }

        const templateSelected = (row) => {
            return <span>{row.name}</span>
        }
        return(
            <AutoComplete
                forceSelection
                multiple={true}
                id={this.props.id}
                value={this.props.value}
                field="name"
                suggestions={this.state.suggestions}
                completeMethod={searchPerson}
                onChange={(e) => {
                    if (!this.props.multiple) {
                        if (this.props.value) {
                            if (this.props.value.length > 0) {
                                // Reject
                                return;
                            }
                        }
                    }
                    this.props.cb({[this.props.id]: e.value})
                }}
                className={"child-w-100 w-100"}
                itemTemplate={templateList}
                selectedItemTemplate={templateSelected}
            />
        );
    }
}

export default PersonSelector