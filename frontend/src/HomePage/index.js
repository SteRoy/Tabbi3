import React from "react";
import NavBar from "../NavBar";

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <NavBar active="home"/>
        );
    }
}

export default HomePage;