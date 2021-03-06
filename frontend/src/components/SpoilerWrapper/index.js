import React from "react";

class SpoilerWrapper extends React.Component {

    render() {
        return (
            <span
                onMouseDown={(e) => this.props.cbToggle(true)}
                onMouseUp={(e) => this.props.cbToggle(false)}
            >
                {this.props.body}
                <small><i>Hold down left click to show round details</i></small>
            </span>
        );
    }
}

export default SpoilerWrapper;