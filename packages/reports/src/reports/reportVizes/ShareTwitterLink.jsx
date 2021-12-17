import React, {Component} from "react";
import {withNamespaces} from "react-i18next";

class ShareTwitterLink extends Component {
  render() {
    const {link, slug, t} = this.props;

    return (
      <a className="share-twitter cp-button u-font-xs"
        href={ `https://www.twitter.com/share?url=${link}${ slug ? `#${slug}` : "" }` }
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="cp-button-icon share-fb-icon" viewBox="0 0 800 800" width="20" height="20"><path d="M679 239s-21 34-55 57c7 156-107 329-314 329-103 0-169-50-169-50s81 17 163-45c-83-5-103-77-103-77s23 6 50-2c-93-23-89-110-89-110s23 14 50 14c-84-65-34-148-34-148s76 107 228 116c-22-121 117-177 188-101 37-6 71-27 71-27s-12 41-49 61c30-2 63-17 63-17z"/></svg>
        <span className="cp-button-text">
          {t("CMS.Options.Share on Twitter")}
        </span>
      </a>
    );
  }
}

export default withNamespaces()(ShareTwitterLink);
