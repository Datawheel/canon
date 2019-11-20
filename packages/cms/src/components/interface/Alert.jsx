import React, {Component} from "react";
import {Alert as BPAlert, Intent} from "@blueprintjs/core";

/** for now, this is just a wrapper around the blueprint Alert */
export default class Alert extends Component {
  render() {
    const defaultConfig = {
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
      intent: Intent.DANGER
    };

    // merge the defaults & props
    const config = {...defaultConfig, ...this.props};

    // TODO: replace blueprint alert with a custom, non-ugly one
    return <BPAlert {...config} />;
  }
}
