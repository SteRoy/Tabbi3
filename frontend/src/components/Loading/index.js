import React from 'react';
import GridLoader from "react-spinners/GridLoader";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {Skeleton} from "primereact/skeleton";
import loaderGif from './Tabbi3-Loader.gif';

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
        const bodyTemplate = () => {
            return <Skeleton/>
        }
        return(
            this.props.datatable ?
                <DataTable value={[{a:'b'},{a:'b'},{a:'b'},{a:'b'}]} className="p-datatable-striped">
                    {
                        this.props.datatable.map(col => <Column header={col.header} body={bodyTemplate}/>)
                    }
                </DataTable>
                :
                <div className="text-center">
                    {/*<GridLoader
                        size={30}
                        color={'aqua'}
                        loading={true}
                    />*/}
                    <img src={loaderGif} />
                    <p className="text-white display-5">Loading{this.state.ellipsis}</p>
                </div>
        )
    }
}

export default Loading;