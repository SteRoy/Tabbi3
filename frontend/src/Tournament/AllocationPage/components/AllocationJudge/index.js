import React from "react";

class AllocationJudge extends React.Component {
    render() {
        return (
            <div className="p-grid judge-card">
                <div className="judge-card-score mr-1 p-col-4">
                    <b className="mr-1">{this.props.score}</b>
                </div>
                <div className="p-col-7">
                    <div className="judge-card-text">{this.props.name}</div>
                </div>
            </div>
        )
    }
}

export default AllocationJudge;