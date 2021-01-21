import React from "react";
import {Password} from "primereact/password";
import {InputText} from "primereact/inputtext";
import {Chips} from "primereact/chips";
import InstitutionSelector from "../InstitutionSelector";
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
                            tooltip={this.props.tooltip}
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
                {
                    this.props.type === "chips" ?
                        <span>
                            <Chips
                                value={this.props.value}
                                id={this.props.id}
                                className={`w-100 child-w-100 ${this.props.errors[this.props.id] ? "p-invalid" : ""}`}
                                onChange={(e) => this.props.cb({[this.props.id]: e.value})}
                                allowDuplicate={false}
                            />
                            <small>{this.props.tooltip}</small>
                        </span>
                        : ""
                }
                {
                    this.props.type === "institution" ?
                        <div>
                            <InstitutionSelector
                                institutions={this.props.options()}
                                id={this.props.id}
                                onSelect={(dict) => this.props.cb(dict)}
                                value={this.props.value}
                            />
                        </div>
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