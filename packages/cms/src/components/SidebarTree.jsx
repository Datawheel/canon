import React, {Component} from "react";
import {Tree} from "@blueprintjs/core";
import "./SidebarTree.css";

// just a wrapper for the blueprint component for now
export default class SidebarTree extends Component {
  render() {
    return <Tree {...this.props} />;
  }
}
