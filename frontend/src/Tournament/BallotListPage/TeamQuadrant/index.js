import React from "react";
import {InputNumber} from "primereact/inputnumber";
import {Dropdown} from "primereact/dropdown";

class TeamQuadrant extends React.Component {
    constructor(props) {
        super(props);
        this.swingOptions = [
            {value: "swing", label: `${props.team.name} was replaced completely by a Swing`},
            {value: "s1IronSpoke", label: `${props.team.speakers[0].name} gave both speeches (iron spoke)`},
            {value: "s2IronSpoke", label: `${props.team.speakers[1].name} gave both speeches (iron spoke)`},
        ]
    }

    render() {
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
                            <InputNumber length={3} min={50} max={100} inputStyle={{width: '50px'}} style={{width: '50px'}}/>
                        </div>
                    </div>
                )}


                <div className="p-grid p-justify-between p-align-center">

                    <div className="p-col-8 text-left">
                        <Dropdown
                            options={this.swingOptions}
                            placeholder={"Select Abnormalities"}
                        />
                    </div>


                    {/* position-first, position-second, position-third, position-fourth */}
                    <div className="p-col-4 text-right">
                        <span style={{width: "50px", border: '1px solid rgb(0,0,0,.1)', padding: '10px'}} className="position-first">1st</span>
                        <span style={{width: "50px", border: '1px solid rgb(0,0,0,.1)', padding: '10px'}} className="bg-light">100</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default TeamQuadrant;