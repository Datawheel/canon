import axios from "axios";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {fetchData} from "@datawheel/canon-core";
import {Dialog} from "@blueprintjs/core";

import libs from "../utils/libs";

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
      modalSlug: null,
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
      onSetVariables: this.onSetVariables.bind(this),
      onOpenModal: this.onOpenModal.bind(this),
      variables,
      locale
    };
  }

  /** 
   * Visualizations have the ability to "break out" and open a modal.
   */
  onOpenModal(modalSlug) {
    this.setState({modalSlug});
  }

  /** 
   * Visualizations have the ability to "break out" and override a variable in the variables object.
   * This requires a server round trip, because the user may have changed a variable that would affect 
   * the "allowed" status of a given section.
   */
  onSetVariables(newVariables) {
    const {profile, selectors, loading} = this.state;
    const {id, variables} = profile;
    const {locale} = this.props;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(newVariables).every(key => variables[key] === newVariables[key]);
    if (!loading && !alreadySet) {
      this.setState({loading: true});
      const url = `/api/profile?profile=${id}&locale=${locale}&${Object.entries(selectors).map(([key, val]) => `${key}=${val}`).join("&")}`;
      const payload = {variables: Object.assign({}, variables, newVariables)};
      axios.post(url, payload)
        .then(resp => {
          this.setState({profile: resp.data, loading: false});
        });
    }
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
    const {profile, loading, modalSlug} = this.state;

    let {sections} = profile;
    // Find the first instance of a Hero section (excludes all following instances)
    const heroSection = sections.find(l => l.type === "Hero");
    // Remove all non-heroes from sections.
    if (heroSection) sections = sections.filter(l => l.type !== "Hero");
    // Remove all "modal" sections from normal rendering"
    sections = sections.filter(l => l.position !== "modal");

    // rename old section names
    sections.forEach(l => {
      if (l.type === "TextViz" || l.position === "sticky") l.type = "Default";
      if (l.type === "Card") l.type = "InfoCard";
      if (l.type === "Column") l.type = "SingleColumn";
    });

    const groupableSections = ["InfoCard", "SingleColumn"]; // sections to be grouped together
    let innerGroupedSections = []; // array for sections to be accumulated into
    let groupedSections = [];

    // make sure there are sections to loop through (issue #700)
    if (sections.length) {
      // reduce sections into a nested array of groupedSections
      innerGroupedSections.push(sections.reduce((arr, section) => {
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
            innerGroupedSections.push(arr);
            arr = [section];
          }
        }
        return arr;
      }, []));

      groupedSections = innerGroupedSections.reduce((arr, group) => {
        if (arr.length === 0 || group[0].type === "Grouping") arr.push([group]);
        else arr[arr.length - 1].push(group);
        return arr;
      }, []);
    }

    const modalSection = modalSlug ? profile.sections.find(s => s.slug === modalSlug) : null;

    return (
      <React.Fragment>
        <div className="cp">
          <Hero profile={profile} contents={heroSection || null} />

          {/* main content sections */}
          <main className="cp-main" id="main">
            {groupedSections.map((groupings, i) =>
              <div className="cp-grouping" key={i}>
                {groupings.map((innerGrouping, ii) => innerGrouping.length === 1
                  // ungrouped section
                  ? <Section
                    contents={innerGrouping[0]}
                    headingLevel={groupedSections.length === 1 || ii === 0 ? "h2" : "h3"}
                    loading={loading}
                    key={`${innerGrouping[0].slug}-${ii}`}
                  />
                  // grouped sections
                  : <SectionGrouping layout={innerGrouping[0].type}>
                    {innerGrouping.map((section, iii) =>
                      <Section
                        contents={section}
                        headingLevel={groupedSections.length === 1 || ii === 0
                          ? iii === 0 ? "h2" : "h3"
                          : "h4"
                        }
                        loading={loading}
                        key={`${section.slug}-${iii}`}
                      />
                    )}
                  </SectionGrouping>
                )}
              </div>
            )}
          </main>
        </div>
        <Dialog
          isOpen={modalSection}
          onClose={() => this.setState({modalSlug: null})}
          usePortal={false}
          icon={false}
        >
          <div className="bp3-dialog-body">
            <Section
              isModal={true}
              contents={modalSection}
              loading={loading}
            />
          </div>
        </Dialog>
      </React.Fragment>
    );
  }
}

Profile.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  onSelector: PropTypes.func,
  onSetVariables: PropTypes.func,
  onOpenModal: PropTypes.func
};

Profile.need = [
  fetchData("profile", "/api/profile/?slug=<slug>&id=<id>&slug2=<slug2>&id2=<id2>&slug3=<slug3>&id3=<id3>&locale=<i18n.locale>"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  locale: state.i18n.locale,
  profile: state.data.profile
}))(hot(Profile));
