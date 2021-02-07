import React from "react";
import {Password} from "primereact/password";
import {InputText} from "primereact/inputtext";
import {Chips} from "primereact/chips";
import InstitutionSelector from "../InstitutionSelector";
import {Calendar} from "primereact/calendar";
import PersonSelector from "../PersonSelector";
import {Dropdown} from "primereact/dropdown";
import {InputNumber} from "primereact/inputnumber";
import {Checkbox} from "primereact/checkbox";
import {InputTextarea} from "primereact/inputtextarea";
import { Slider } from 'primereact/slider';
import {Knob} from "primereact/knob";
const ttlib = require("ttlib");

class InputBox extends React.Component {
    render() {
        return (
            <span className="p-mt-4">
                {
                    this.props.hideLabel ? "" : <label htmlFor={this.props.id} className={`${this.props.type === "boolean" ? 'p-mb-0' : ''}`}>{this.props.label ? this.props.label : ttlib.string.toTitleCase(this.props.id)}</label>
                }
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
                    this.props.type === "number" ?
                        <InputNumber
                            className={`w-100 ${this.props.errors[this.props.id] ? "p-invalid" : ""}`}
                            id={this.props.id}
                            value={this.props.value}
                            min={this.props.min}
                            max={this.props.max}
                            step={1}
                            onValueChange={(e) => this.props.cb({[this.props.id]: e.target.value})}
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
                            {this.props.tooltip ?
                                <div><small>{this.props.tooltip}</small></div>
                                :
                                ""
                            }
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
                            />
                            {this.props.tooltip ?
                                <div><small>{this.props.tooltip}</small></div>
                                : ""}
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
                                appendTo={document.body}
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
                { this.props.type === "boolean" ?
                    <div className="p-mt-0">
                        {
                            this.props.hideLabel ?
                                "" :
                                <div>
                                    <small>{this.props.tooltip}</small>
                                </div>
                        }
                        <Checkbox
                            inputId={this.props.id}
                            name={this.props.id}
                            checked={this.props.value}
                            onChange={
                                (e) => {this.props.cb({[this.props.id]: e.checked})}
                            }
                        />
                    </div> : ""
                }
                { this.props.type === "textarea" ?
                    <InputTextarea
                        id={this.props.id}
                        value={this.props.value}
                        className="w-100"
                        onChange={
                            (e) => this.props.cb({[this.props.id]: e.target.value})

                        }
                    /> : ""
                }
                { this.props.type === "ranking" ?
                    <div className="text-center">
                        <Knob
                            id={this.props.id}
                            value={this.props.value}
                            className="w-100"
                            step={1}
                            min={0}
                            max={100}
                            size={150}
                            onChange={
                                (e) => this.props.cb({[this.props.id]: e.value})

                            }
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