import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import Clipboard from "react-clipboard.js";

import {Icon} from "@blueprintjs/core";

import "./ShareDirectLink.css";

// displays share link and copies it to clipboard
class ShareDirectLink extends Component {

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
    const {fontSize, label, link, slug, t} = this.props;
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
    const buttonText = !copied ? t("CMS.Options.Copy") : t("CMS.Options.Copied");

    // use label as Clipboard wrapper so that clicking anything within triggers the copy event
    return (
      <div className="bp3-label share-direct-link-wrapper">
        <span className="options-label-text label">
          {label || t("CMS.Options.Direct link")}
        </span>

        <Clipboard
          className={`cp-input-label u-font-${fontSize} clipboard-label${copied ? " is-copied" : ""}`}
          data-clipboard-text={copyText}
          component="label"
          onSuccess={this.onSuccess}>

          <span className="u-visually-hidden">
            {label || t("CMS.Options.Direct link")}
          </span>

          {/* link icon */}
          <Icon icon="clipboard" className="clipboard-icon" />

          {/* input with text */}
          <input className="cp-input u-font-sm clipboard-input" value={displayText} readOnly />

          {/* fake button */}
          <span className="clipboard-button cp-button">
            <span className="clipboard-button-text cp-button-text button-text">
              {buttonText}
            </span>
          </span>
        </Clipboard>
      </div>
    );
  }
}

ShareDirectLink.defaultProps = {
  fontSize: "sm"
};

export default withNamespaces()(ShareDirectLink);
