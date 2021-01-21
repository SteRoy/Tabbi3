import React from "react";
import {Password} from "primereact/password";
import {InputText} from "primereact/inputtext";
import {Chips} from "primereact/chips";
import InstitutionSelector from "../InstitutionSelector";
import {Calendar} from "primereact/calendar";
import PersonSelector from "../PersonSelector";
import {Dropdown} from "primereact/dropdown";
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
                            disabled={this.props.readOnly}
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
                {
                    this.props.type === "people" ?
                        <div>
                            <PersonSelector
                                options={this.props.options()}
                                id={this.props.id}
                                cb={(dict) => this.props.cb(dict)}
                                value={this.props.value}
                                multiple={true}
                            />
                        </div>
                        : ""
                }
                {
                    this.props.type === "person" ?
                        <div>
                            <PersonSelector
                                options={this.props.options()}
                                id={this.props.id}
                                cb={(dict) => this.props.cb(dict)}
                                value={this.props.value}
                                multiple={false}
                            />
                        </div>
                        : ""
                }
                {
                    this.props.type === "dropdown" ?
                        <div>
                            <Dropdown
                                options={this.props.options()}
                                id={this.props.id}
                                onChange={(e) => this.props.cb({[this.props.id]: e.value})}
                                value={this.props.value}
                                className={`w-100 ${this.props.errors[this.props.id] ? 'p-invalid' : ''}`}
                            />
                        </div>
                        : ""
                }
                {
                    this.props.type === "date" ?
                        <div>
                            <Calendar
                                id={this.props.id}
                                value={this.props.value}
                                onChange={(e) => this.props.cb({[this.props.id]: e.value})}
                                dateFormat="dd/mm/yy"
                                showTime={this.props.time}
                                className="w-100"
                                hourFormat="24"
                                appendTo={document.body}
                                panelClassName="w-25-override"
                            />
                        </div>
                        :
                        ""
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