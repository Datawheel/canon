import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import Topic from "./Topic";
import libs from "../utils/libs";

class Profile extends Component {

  getChildContext() {
    const {formatters, locale, profile, router} = this.props;
    const {variables} = profile;
    return {
      formatters: formatters.reduce((acc, d) => {
        const f = Function("n", "libs", "locale", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, locale, acc);
        return acc;
      }, {}),
      router,
      variables,
      locale
    };
  }

  render() {
    const {profile} = this.props;
    const {topics} = profile;
    

    return (
      <div id="Profile">
        <h1 dangerouslySetInnerHTML={{__html: profile.title}} />
        <h3 dangerouslySetInnerHTML={{__html: profile.subtitle}} />
        {topics.map(topic => <Topic key={topic.slug} contents={topic} />)}
      </div>
    );
  }

}

Profile.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object
};

Profile.need = [
  fetchData("profile", "/api/profile/?slug=<slug>&id=<id>&slug2=<slug2>&id2=<id2>&slug3=<slug3>&id3=<id3>&locale=<i18n.locale>"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  locale: state.i18n.locale,
  profile: state.data.profile
}))(Profile);
