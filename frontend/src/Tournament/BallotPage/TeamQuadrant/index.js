import React from "react";
import {InputNumber} from "primereact/inputnumber";
import {Dropdown} from "primereact/dropdown";

class TeamQuadrant extends React.Component {
    constructor(props) {
        super(props);
        this.swingOptions = [
            {value: "replacedBySwing", label: `${props.team.name} was replaced completely by a Swing`},
            {value: "speakerOneSpokeTwice", label: `${props.team.speakers[0].name} gave both speeches`},
            {value: "speakerTwoSpokeTwice", label: `${props.team.speakers[1].name} gave both speeches`},
        ]
    }

    render() {
        const rankingDisplay = ["-", "1st", "2nd", "3rd", "4th"];
        const rankingClasses = ["", "position-first", "position-second", "position-third", "position-fourth"];

        return (
            <div style={{paddingTop: `${this.props.opening ? '0' : '0.5rem'}`}}>
                <div style={
                    {
                        width: '120px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                    }
                }
                >
                    <small>{this.props.position} - {this.props.team.name}</small>
                </div>
                {this.props.team.speakers.map(speaker =>
                    <div className="p-grid p-justify-between p-align-center">
                        <div className="p-col-8">
                            <span>{speaker.name}</span>
                        </div>
                        <div className="p-col-4 text-right">
                            <InputNumber
                                length={3}
                                min={0}
                                value={speaker.speakerPoints}
                                inputStyle={{width: '50px'}}
                                style={{width: '50px'}}
                                onChange={(e) => this.props.cb(speaker.id, {speakerPoints: e.value})}
                            />
                            {
                                speaker.error ? <div>
                                    <small className="text-danger">{speaker.error}</small>
                                </div> : ""
                            }
                        </div>
                    </div>
                )}


                <div className="p-grid p-justify-between p-align-center">

                    <div className="p-col-8 text-left">
                        <Dropdown
                            options={this.swingOptions}
                            showClear={true}
                            placeholder={"Select Abnormality"}
                            onChange={(e) => this.props.cb(null, {abnormality: e.value})}
                            value={this.props.team.abnormality}
                        />
                    </div>


                    {/* position-first, position-second, position-third, position-fourth */}
                    <div className="p-col-4 text-right">
                        <span style={{width: "50px", border: '1px solid rgb(0,0,0,.1)', padding: '10px'}} className={
                            `${rankingClasses[this.props.team.ranking]}`
                        }>
                            {this.props.team.ranking === "TIE" ? "TIE" : rankingDisplay[this.props.team.ranking]}
                        </span>
                        <span style={{width: "50px", border: '1px solid rgb(0,0,0,.1)', padding: '10px'}} className="bg-light">
                            {
                                this.props.team.speakers[0].speakerPoints > 0 && this.props.team.speakers[1].speakerPoints > 0 ?
                                    this.props.team.speakers[0].speakerPoints + this.props.team.speakers[1].speakerPoints
                                :
                                    "-"
                            }
                        </span>
                    </div>

                    {
                        this.props.team.error ? <div className="w-100 text-right">
                            <small className="text-danger">{this.props.team.error}</small>
                        </div> : ""
                    }
                </div>
            </div>
        )
    }
}

export default TeamQuadrant;