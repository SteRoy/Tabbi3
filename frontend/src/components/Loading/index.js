import React from 'react';
import GridLoader from "react-spinners/GridLoader";

class Loading extends React.Component {
    constructor() {
        super();
        this.state = {
            ellipsisTimer: null,
            ellipsis: "."
        }
        this.setEllipsis = this.setEllipsis.bind(this);
    }

    componentDidMount() {
        this.setState({
            ellipsisTimer: setInterval(this.setEllipsis, 500)
        })
    }

    componentWillUnmount() {
        if (this.state.ellipsisTimer) {
            clearInterval(this.state.ellipsisTimer);
        }
    }

    setEllipsis() {
        // TODO: ew.
        if (this.state.ellipsis === "") {
            this.setState({
                ellipsis: "."
            })
        } else if (this.state.ellipsis === ".") {
            this.setState({
                ellipsis: ".."
            })
        } else if (this.state.ellipsis === "..") {
            this.setState({
                ellipsis: "..."
            })
        } else {
            this.setState({
                ellipsis: ""
            })
        }
    }

    render() {
        return(
            <div className="text-center">
                <GridLoader
                    size={30}
                    color={'aqua'}
                    loading={true}
                />
                <p className="text-white display-5">Loading{this.state.ellipsis}</p>
            </div>

        )
    }
}

export default Loading;