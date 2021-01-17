import React from "react";

class AllocationJudge extends React.Component {
    render() {
        return (
            <span className={`p-grid judge-card ${this.props.isDragged ? 'color-dragged' : ''}`}>
                <span className="judge-card-score mr-1 p-col-4">
                    <b className="mr-1">{this.props.score}</b>
                </span>
                <span className="p-col-7">
                    <span className="judge-card-text">{this.props.chair ? <b>&copy; {this.props.name}</b> : this.props.name}</span>
                </span>
            </span>
        )
    }
}

export default AllocationJudge;