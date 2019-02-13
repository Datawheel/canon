import React, {Component} from "react";
import PropTypes from "prop-types";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";
import {Topic} from "../../src";
import libs from "../../src/utils/libs";

class Profile extends Component {

  getChildContext() {
    const {formatters, locale, profile, router} = this.props;
    const {variables} = profile;
    return {
      formatters: formatters.reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {}),
      router,
      variables,
      locale
    };
  }

  render() {
    const {topics, title} = this.props.profile;
    return (
      <div id="Profile">
        <h1 dangerouslySetInnerHTML={{__html: title}} />
        {topics.map(topic => {
          const {slug} = topic;
          return <Topic key={slug} contents={topic} />;
        })}
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
  fetchData("profile", "/api/profile/<pslug>/<pid>?locale=<i18n.locale>"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  locale: state.i18n.locale,
  profile: state.data.profile
}))(Profile);
