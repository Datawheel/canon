import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Status.css";

export default class Status extends Component {
  render() {
    const {recompiling} = this.props;

    return (
      <p className={`cms-status ${recompiling ? "is-recompiling" : "is-done"}`}>
        <Icon className="cms-status-icon" icon={ recompiling ? "more" : "tick"} />
        { recompiling ? "Updating Variables" : "Variables Loaded" }
      </p>
    );
  }
}
