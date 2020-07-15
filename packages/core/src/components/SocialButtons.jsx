import React, {Component} from "react";
import facebookIcon from "../images/facebook-logo.svg";
import twitterIcon from "../images/twitter-logo.svg";
import instagramIcon from "../images/instagram-logo.svg";
import googleIcon from "../images/google-logo.svg";
import githubIcon from "../images/github-logo.svg";
import linkedinIcon from "../images/linkedin-logo.svg";
import {withNamespaces} from "react-i18next";

class SocialButtons extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {social, t} = this.props;

    if (!social || !social.length) {
      return null;
    }
    return <div id="socials">
      { social.includes("facebook") ? <a href="/auth/facebook" className="bp3-button facebook"><img className="icon" src={facebookIcon} /><span>{ t("Login.Facebook") }</span></a> : null }
      { social.includes("github") ? <a href="/auth/github" className="bp3-button github"><img className="icon" src={githubIcon} /><span>{ t("Login.Github") }</span></a> : null }
      { social.includes("google") ? <a href="/auth/google" className="bp3-button google"><img className="icon" src={googleIcon} /><span>{ t("Login.Google") }</span></a> : null }
      { social.includes("twitter") ? <a href="/auth/twitter" className="bp3-button twitter"><img className="icon" src={twitterIcon} /><span>{ t("Login.Twitter") }</span></a> : null }
      { social.includes("instagram") ? <a href="/auth/instagram" className="bp3-button instagram"><img className="icon" src={instagramIcon} /><span>{ t("Login.Instagram") }</span></a> : null }
      { social.includes("linkedin") ? <a href="/auth/linkedin" className="bp3-button linkedin"><img className="icon" src={linkedinIcon} /><span>{ t("Login.LinkedIn") }</span></a> : null }
    </div>;
  }
}

SocialButtons = withNamespaces()(SocialButtons);
export {SocialButtons};
