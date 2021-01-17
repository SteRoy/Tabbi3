import React from 'react';

class MotionCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            display: false
        }
    }

    render() {

        return (
            <div className="p-col text-white text-center border-right">
                <div className="display-3 border-bottom">{this.props.header}</div>
                <div className={`my-5 display-4 ${this.state.display ? "" : "blur"}`}>{this.props.text}</div>
                <button
                    className="btn btn-block btn-danger"
                    onClick={() => this.setState({display: !this.state.display})}
                >
                    {this.state.display ? "Hide" : "Show"} {this.props.header}
                </button>
            </div>
        )
    }
}

export default MotionCard;
