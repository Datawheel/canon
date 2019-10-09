import React, {Component} from "react";
import {withNamespaces} from "react-i18next";

class ShareFacebookLink extends Component {
  render() {
    const {link, slug, t} = this.props;

    return (
      <a className="share-fb cp-button u-font-xs"
        href={ `https://www.facebook.com/sharer/sharer.php?u=${link}${ slug ? `#${slug}` : "" }` }
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="cp-button-icon share-fb-icon" viewBox="0 0 800 800" width="20" height="20"><path d="M604 170c15 0 26 11 26 26v408c0 15-11 26-26 26H487V452h60l9-70h-69v-44c0-20 6-34 35-34h37v-62s-24-3-54-3c-53 0-89 33-89 92v51h-60v70h60v178H196c-15 0-26-11-26-26V196c0-15 11-26 26-26h408z"/></svg>
        <span className="cp-button-text">
          {t("CMS.Options.Share on Facebook")}
        </span>
      </a>
    );
  }
}

export default withNamespaces()(ShareFacebookLink);
