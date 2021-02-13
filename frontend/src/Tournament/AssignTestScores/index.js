import React from "react";
import { Card } from 'primereact/card';
import {Redirect} from "react-router-dom";
import NavBar from "../../NavBar";
import TournamentToolBar from "../../components/TournamentToolBar";
import {Toast} from "primereact/toast";
import InputBox from "../../components/InputBox";
import {Button} from "primereact/button";
import Loading from "../../components/Loading";
const ttlib = require("ttlib");

class AssignTestScores extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTestScore: 0,
            adjudicators: [],
            current: 0,
            errors: {},
            loading: true
        }
        this.nextAdjudicator = this.nextAdjudicator.bind(this);
        this.setAdjRanking = this.setAdjRanking.bind(this);
    }

    componentDidMount() {
        ttlib.api.requestAPI(
            `/tournaments/${this.props.match.params.slug}/adjudicators`,
            'GET',
            (adjudicatorsData) => {
                let adjudicators = adjudicatorsData.adjudicators;
                adjudicators = adjudicators.map(adj => (
                    {
                        ...adj,
                        name: adj.Person.name
                    }
                )).filter(adj => this.props.match.params.adjudicatorid ? adj.id === this.props.match.params.adjudicatorid : adj.testScore === 0);

                this.setState({adjudicators, loading: false});
            },
            () => {}
        )
    }

    nextAdjudicator() {
        this.setState({
            current: this.state.current + 1 % this.state.adjudicators.length
        })
    }

    setAdjRanking() {
        const adjId = this.state.adjudicators[this.state.current].id;

        if (adjId) {
            if (this.state.currentTestScore === 0) {
                return this.setState({
                    errors: {
                        "currentTestScore": "You must select a test score"
                    }
                });
            }

            ttlib.api.requestAPI(
                `/tournaments/${this.props.match.params.slug}/adjudicators/${adjId}/score/${this.state.currentTestScore}`,
                `POST`,
                (respData) => {
                    let curAdj = this.state.adjudicators.filter(a => a.id !== adjId);
                    this.setState({
                        adjudicators: curAdj,
                        errors: {},
                        currentTestScore: 0
                    });
                    ttlib.component.toastSuccess(this.toast, `Test Score Updated`, `The adjudicator's test score has been updated.`);
                },
                (error) => {
                    ttlib.component.toastError(this.toast, `Test Score Update Failed`, error);
                },
                {}
            )
        }
    }

    render() {
        const getDescription = (score) => {
            if (score === 0) {
                return <div className="alert alert-primary">This adjudicator has no test score set.</div>
            } else if (score < 10) {
                return <div className="alert alert-danger">This adjudicator doesn't comprehend the fundamentals of British Parliamentary debating.</div>
            } else if (score < 20) {
                return <div className="alert alert-danger">This adjudicator understands the rules of British Parliamentary debating but is unable to apply them meaningfully in adjudications without signficant guidance.</div>
            } else if (score < 30) {
                return <div className="alert alert-danger">This adjudicator is capable of making very basic comparisons between teams when prompted.</div>
            } else if (score < 40) {
                return <div className="alert alert-warning">This adjudicator is capable of making basic comparisons between teams and contributing to discussions.</div>
            } else if (score < 50) {
                return <div className="alert alert-warning">This adjudicator is capable of understanding nuance in arguments and applying this nuance to the adjudication. This adjudicator would make an average wing.</div>
            } else if (score < 60) {
                return <div className="alert alert-info">This adjudicator has a clear understanding of the nuance in most debates and provides meaningful comparisons which enrich a discussion. This adjudicator would make an above average wing but is not ready to lead discussions.</div>
            } else if (score < 70) {
                return <div className="alert alert-info">This adjudicator has the understanding of at least an above average wing and can lead panel discussions in weaker rooms.</div>
            } else if (score < 80) {
                return <div className="alert alert-success">This adjudicator can manage panel discussions in clear rooms where all teams will make nuanced contributions but calls are still mostly deterministic.</div>
            } else if (score < 90) {
                return <div className="alert alert-success">This adjudicator can manage critical panel discussions in rooms where nuanced contributions make break-relevant decisions. This adjudicator will be capable of leading panels of strong adjudicators.</div>
            } else {
                return <div className="alert alert-success">This adjudicator would be a meaningful member of a WUDC Grand Final panel.</div>
            }
        }


        return (
            <div>
                <NavBar active="" userCB={(loggedInUser, loggedIn) => this.setState({loggedInUser, loggedIn})}/>
                <Toast ref={(ref) => this.toast = ref}/>
                {this.state.selected ? <Redirect to={`/tournament/${this.props.match.params.slug}/adjudicators/${this.state.selected.id}`}/> : ""}
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-8">
                        <TournamentToolBar slug={this.props.match.params.slug} user={this.state.loggedInUser} loggedIn={this.state.loggedIn}/>
                        {
                            this.state.loading ? <Loading/> :
                                <Card>
                                    {
                                        this.state.adjudicators.length > 0 ?
                                            <span>
                                                <div className="display-4 text-center">Adjudicator Test Score Assignment</div>
                                                <div className="w-100 text-center">{this.state.adjudicators.length - 1} Pending</div>
                                                <hr/>
                                                <div className="display-5 text-center">
                                                    {this.state.adjudicators[this.state.current] ? this.state.adjudicators[this.state.current].name : ""}
                                                </div>
                                                <p>
                                                    TODO: Insert adjudicator CV in here
                                                </p>
                                                <InputBox
                                                    id="currentTestScore"
                                                    label="Test Score"
                                                    type="ranking"
                                                    value={this.state.currentTestScore}
                                                    cb={(dict) => this.setState(dict)}
                                                    errors={this.state.errors}
                                                />
                                                    {
                                                        getDescription(this.state.currentTestScore)
                                                    }

                                                    <div>
                                                    <Button onClick={this.setAdjRanking} label="Save Test Score" className="btn-block p-button-success"/>
                                                    <Button onClick={this.nextAdjudicator} label="Skip Adjudicator" className="btn-block p-button-outlined p-button-secondary"/>
                                                </div>
                                            </span> :
                                            <span>
                                                <div className="display-4 text-center">All Completed</div>
                                            </span>
                                    }
                            </Card>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default AssignTestScores;