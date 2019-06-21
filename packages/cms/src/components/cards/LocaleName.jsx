import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import ISO6391 from "iso-639-1";
import "./LocaleName.css";

// TODO: make this a helper function instead of a component
export default class LocaleName extends Component {
  render() {
    const {locale, children} = this.props;
    return (
      <h4 className="cms-locale-name font-xxxs">
        <Icon className="cms-locale-name-icon" icon="translate" />
        {ISO6391.getName(locale || children)}
      </h4>
    );
  }
}
