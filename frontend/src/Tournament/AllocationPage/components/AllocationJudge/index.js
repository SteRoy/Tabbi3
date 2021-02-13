import React from "react";

class AllocationJudge extends React.Component {
    render() {
        const name = (name) => {
            const nameArr = name.split(" ");
            if (nameArr.length > 1) {
                return `${nameArr[0]} ${(nameArr[nameArr.length - 1].substring(0,1))}.`;
            } else {
                return name;
            }
        }

        const clashToClass = {
            'hard': 'clashed-personal',
            'soft': 'clashed-soft',
            'institutional': 'clashed-institution-current'
        }

        return (
            <span className={`p-grid judge-card ${this.props.isDragged ? 'color-dragged' : ''} ${this.props.clashInfo && !this.props.isDragged ? clashToClass[this.props.clashInfo] : ""}`}>
                <span className="judge-card-score mr-1 p-col-4">
                    <b className="mr-1">{this.props.score}</b>
                </span>
                <span className="p-col-7">
                    <span className="judge-card-text">{this.props.chair ? <b>&copy; {name(this.props.name)}</b> : name(this.props.name)}</span>
                </span>
            </span>
        )
    }
}

export default AllocationJudge;