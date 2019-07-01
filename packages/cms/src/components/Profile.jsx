import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import Section from "./sections/Section";
import libs from "../utils/libs";

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profile: props.profile,
      selectors: {},
      loading: false
    };
  }

  getChildContext() {
    const {formatters, locale, router} = this.props;
    const {profile} = this.state;
    const {variables} = profile;
    return {
      formatters: formatters.reduce((acc, d) => {
        const f = Function("n", "libs", "locale", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, locale, acc);
        return acc;
      }, {}),
      router,
      onSelector: this.onSelector.bind(this),
      variables,
      locale
    };
  }

  onSelector(name, value) {

    const {profile, selectors} = this.state;
    const {id, variables} = profile;
    const {locale} = this.props;

    if (value instanceof Array && !value.length) delete selectors[name];
    else selectors[name] = value;

    this.setState({loading: true, selectors});
    const url = `/api/profile?profile=${id}&locale=${locale}&${Object.entries(selectors).map(([key, val]) => `${key}=${val}`).join("&")}`;
    const payload = {variables};
    axios.post(url, payload)
      .then(resp => {
        this.setState({profile: resp.data, loading: false});
      });

  }

  render() {
    const {profile, loading} = this.state;
    const {sections} = profile;

    return (
      <div id="Profile">
        <h1 dangerouslySetInnerHTML={{__html: profile.title}} />
        <h3 dangerouslySetInnerHTML={{__html: profile.subtitle}} />
        {sections.map((section, i) => <Section key={`${section.slug}-${i}`} loading={loading} contents={section} />)}
      </div>
    );
  }

}

Profile.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  onSelector: PropTypes.func
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
