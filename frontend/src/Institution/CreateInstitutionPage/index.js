import React from 'react';
import InputBox from "../../components/InputBox";
import Fuse from 'fuse.js';
const ttlib = require("ttlib");

class CreateInstitutionPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            shortName: "",
            aliases: [],
            institutions: [],
            closestResults: [],
            errors: {}
        }
        this.fields = [
            {id: "name", type: "text", label: "Institution Name"},
            {id: "shortName", type: "text", label: "Short Name", tooltip: "A shortened version for the institution to be known as e.g. Oxford Union Society -> Oxford."},
            {id: "aliases", type: "chips", label: "Aliases", tooltip: "Add any other names that this society is known by. Press ENTER after every new alias."}
        ];
        this.fuseOptions = {
            keys: ['name', 'InstitutionAliases.alias'],
            includeScore: true
        }

        this.changeState = this.changeState.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/institutions/options`,
            'GET',
            (respData) => {
                this.fuse = new Fuse(respData.institutions, this.fuseOptions);
                console.log(respData);
                this.setState(respData)
            },
            (errorMessage) => {}
            )
    }

    changeState(dict) {
        this.setState(dict);
        if (this.fuse) {
            const searchTerms = [this.state.name, this.state.shortName].concat(this.state.aliases);
            const searchResults = searchTerms
                .map(term => this.fuse.search(term, {limit: 5}))
                .flat()
                .slice(0, 6);
            let unique = [];
            searchResults.forEach(result => {
                if (!unique.find(elem => elem.refIndex === result.refIndex)) {
                    unique.push(result);
                }
            })
            this.setState({
                closestResults: unique
            })

        }
    }

    save() {
        ttlib.api.requestAPI(
            `/institutions/create`,
            `POST`,
            (respData) => {
                this.props.onSuccess();
            },
            (errorMessage) => {},
            {
                name: this.state.name,
                shortName: this.state.shortName,
                aliases: this.state.aliases
            }
        );
    }

    render() {
        return(
            <div>
                {
                    this.state.closestResults.length > 0 ?
                        <div className="alert alert-warning">
                            <h5>Wait! Are you sure you don't mean:</h5>
                            <ul>
                                {
                                    this.state.closestResults.map(institution => (
                                        <li>{institution.item.name}</li>
                                    ))
                                }
                            </ul>
                            <p>Tabbi3 relies upon institutions being <b>unique</b> so please <b>double check</b> that you're not creating a society that already exists!</p>
                        </div>
                        :
                        ""
                }
                {
                    this.fields.map(field => (
                        <InputBox
                            id={field.id}
                            value={this.state[field.id]}
                            cb={(dict) => this.changeState(dict)}
                            errors={this.state.errors}
                            type={field.type}
                            label={field.label}
                            tooltip={field.tooltip}
                        />
                    ))
                }
                <br/>
                <button onClick={this.save} className="btn btn-success btn-block">Save</button>
            </div>
        );
    }
}

export default CreateInstitutionPage