import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Status.css";

export default class Status extends Component {
  render() {
    const {recompiling, busy, done} = this.props;

    return (
      <p className={`cms-status ${recompiling ? "is-recompiling" : "is-done"}`}>
        <Icon className="cms-status-icon" icon={ recompiling ? "refresh" : "tick"} />
        { recompiling ? busy || "Updating variables" : done || "Variables loaded" }
      </p>
    );
  }
}
