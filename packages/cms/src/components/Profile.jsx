import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";

import libs from "../utils/libs";
import stripP from "../utils/formatters/stripP";

import Hero from "./sections/Hero";
import Section from "./sections/Section";
import SectionGrouping from "./sections/components/SectionGrouping";

import "../css/utilities.css";
import "../css/base.css";
import "../css/blueprint-overrides.css";
import "../css/form-fields.css";
import "../css/layout.css";

import "./Profile.css";

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

    let {sections} = profile;
    let heroSection;
    // split out hero from sections array
    if (sections.filter(l => l.type === "Hero").length) {
      // there are somehow multiple hero sections; grab the first one only
      heroSection = sections.filter(l => l.type === "Hero")[0];
      // filter out Hero from sections
      sections = sections.filter(l => l.type !== "Hero");
    }

    const groupableSections = ["Card", "Column"]; // sections to be grouped together
    const groupedSections = []; // array for sections to be accumulated into

    // reduce sections into a nested array of groupedSections
    groupedSections.push(sections.reduce((arr, section) => {
      if (arr.length === 0) arr.push(section); // push the first one
      else {
        const prevType = arr[arr.length - 1].type;
        const currType = section.type;
        // if the current and previous types are groupable and the same type, group them into an array
        if (groupableSections.includes(prevType) && groupableSections.includes(currType) && prevType === currType) {
          arr.push(section);
        }
        // otherwise, push the section as-is
        else {
          groupedSections.push(arr);
          arr = [section];
        }
      }
      return arr;
    }, []));

    return (
      <div className="cp">
        <Hero profile={profile} contents={heroSection} />

        {/* main content sections */}
        <main className="cp-content" id="main">
          {groupedSections.map((grouping, i) => grouping.length === 1
            // ungrouped section
            ? <Section key={`${grouping[0].slug}-${i}`} loading={loading} contents={grouping[0]} />
            // grouped sections
            : <SectionGrouping layout={grouping[0].type}>
              {grouping.map((section, sectionIndex) =>
                <Section key={`${section.slug}-${sectionIndex}`} loading={loading} contents={section} />
              )}
            </SectionGrouping>
          )}
        </main>
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
