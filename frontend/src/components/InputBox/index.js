import React from "react";
import {Password} from "primereact/password";
import {InputText} from "primereact/inputtext";
const ttlib = require("ttlib");

class InputBox extends React.Component {
    render() {
        return (
            <span className="p-mt-4">
                <label htmlFor={this.props.id}>{this.props.label ? this.props.label : ttlib.string.toTitleCase(this.props.id)}</label>
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