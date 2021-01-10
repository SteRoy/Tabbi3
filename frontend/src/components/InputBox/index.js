import React from "react";
import {Password} from "primereact/password";
import {InputText} from "primereact/inputtext";
const ttlibString = require("../../lib/string");

class InputBox extends React.Component {

    login() {

    }

    render() {
        return (
            <span className="p-float-label p-mt-4">
                {
                    this.props.type === "text" ?
                        <InputText
                            className={`w-100 ${this.props.errors[this.props.id] ? "p-invalid" : ""}`}
                            id={this.props.id}
                            value={this.props.value}
                            onChange={(e) => this.props.cb({[this.props.id]: e.target.value})}
                        />
                    : ""
                }
                {
                    this.props.type === "password" ?
                        <Password
                            feedback={false}
                            className={`w-100 ${this.props.errors[this.props.id] ? "p-invalid" : ""}`}
                            id={this.props.id}
                            value={this.props.value}
                            onChange={(e) => this.props.cb({[this.props.id]: e.target.value})}
                        />
                    : ""
                }
                <label htmlFor={this.props.id}>{ttlibString.toTitleCase(this.props.id)}</label>
                {/* Render Error Per Field */}
                {
                    this.props.errors[this.props.id] ?
                        <small id={`${this.props.id}-error`} className="p-invalid p-d-block">
                            {this.props.errors[this.props.id]}
                        </small>
                        : ""
                }
            </span>
        );
    }
}

export default InputBox;