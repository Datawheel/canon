import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Status.css";

/**
  * Currently, this is a fairly specific component for displaying the status
  * of variable replacement in the admin panel, but it could be made more generic.
  * It's fixed to the bottom of the viewport — watch out for transforms on parent elements.
*/
export default class Status extends Component {
  render() {
    const {recompiling, busy, done} = this.props;

    return (
      <p className={`cms-status ${recompiling ? "is-recompiling" : "is-done"}`}>
        <Icon className="cms-status-icon" icon={ recompiling ? "refresh" : "tick"} />
        { recompiling ? busy || "Updating variables…" : done || "Variables loaded" }
      </p>
    );
  }
}
