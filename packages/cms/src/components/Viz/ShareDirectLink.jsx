import React, {Component} from "react";
import Clipboard from "react-clipboard.js";

import {Icon} from "@blueprintjs/core";

import "./ShareDirectLink.css";

// displays share link and copies it to clipboard
export default class ShareDirectLink extends Component {

  constructor(props) {
    super(props);
    this.onSuccess = this.onSuccess.bind(this);
    this.state = {
      copied: false
    };
  }

  // link copied to clipboard
  onSuccess() {
    this.setState({copied: true});
  }

  render() {
    const {link, slug} = this.props;
    const {copied} = this.state;
    // convert the link into a link that works
    // const linkUrl = link.replace(/%3A/g, ":").replace(/%2F/g, "/");

    // text to be copied
    let copyText = link;
    if (slug) {
      copyText = `${link}#${slug}`;
    }
    // chop off http:// for display purposes
    const displayText = link.replace("http://", "");
    // copy "button" text
    const buttonText = !copied ? "copy" : "copied";

    // use label as Clipboard wrapper so that clicking anything within triggers the copy event
    return (
      <Clipboard
        className={`clipboard-label ${copied ? " is-copied" : ""}`}
        data-clipboard-text={ copyText }
        component="label"
        onSuccess={ this.onSuccess }>

        {/* accessibility label */}
        <span className="u-visually-hidden">Direct link</span>

        {/* link icon */}
        <Icon icon="clipboard" className="clipboard-icon" />

        {/* input with text */}
        <input className="bp3-input clipboard-input" value={ displayText } readOnly />

        {/* fake button */}
        <span className="clipboard-button bp3-button font-sm">
          <span className="clipboard-button-text button-text">
            { buttonText }
          </span>
        </span>
      </Clipboard>
    );
  }
}
