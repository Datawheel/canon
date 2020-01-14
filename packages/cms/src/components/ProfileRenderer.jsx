import axios from "axios";
import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {Dialog, Icon} from "@blueprintjs/core";

import libs from "../utils/libs";

import Hero from "./sections/Hero";
import Section from "./sections/Section";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";
import isIE from "../utils/isIE.js";

import deepClone from "../utils/deepClone.js";

import "../css/utilities.css";
import "../css/base.css";
import "../css/blueprint-overrides.css";
import "../css/form-fields.css";
import "../css/layout.css";

import "./Profile.css";

class ProfileRenderer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profile: props.profile,
      // Take a one-time, initial snapshot of the entire variable set at load time to be passed via context.
      // This is necessary because embedded sections need a pure untouched variable set, so they can reset
      // the variables they changed via setVariables back to the original state at load time.
      initialVariables: deepClone(props.profile.variables),
      selectors: {},
      modalSlug: null,
      loading: false,
      setVarsLoading: false
    };
  }

  componentDidMount() {
    if (isIE) this.setState({isIE: true});
  }

  componentDidUpdate(prevProps) {
    const {isModal, sectionID} = this.props;
    // If this is a modal with a sectionID, then this component is being rendered as a section preview
    // in the CMS. When that is the case, the profile could be updated from the OUTSIDE, i.e., the user
    // changes a dropdown in PreviewHeader.jsx. In that case, listen for a new profile from props.
    if (isModal && sectionID) {
      if (JSON.stringify(prevProps.profile) !== JSON.stringify(this.props.profile)) {
        this.setState({profile: this.props.profile});
      }
    }
  }

  getChildContext() {
    const {formatters, locale} = this.props;
    const {router} = this.context;
    const {profile, initialVariables} = this.state;
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
      onOpenModal: this.onOpenModal.bind(this),
      variables,
      initialVariables,
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
    const {profile, selectors, setVarsLoading} = this.state;
    const {id, variables} = profile;
    const {locale, sectionID} = this.props;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(newVariables).every(key => variables[key] === newVariables[key]);
    if (!setVarsLoading && !alreadySet) {
      this.setState({setVarsLoading: true});
      let url = `/api/profile?profile=${id}&locale=${locale}&${Object.entries(selectors).map(([key, val]) => `${key}=${val}`).join("&")}`;
      if (sectionID) url += `&section=${sectionID}`;
      const payload = {variables: Object.assign({}, variables, newVariables)};
      axios.post(url, payload)
        .then(resp => {
          this.setState({profile: resp.data, setVarsLoading: false});
        });
    }
  }

  onSelector(name, value) {

    console.log(name, value);
    const {profile, selectors} = this.state;
    const {id, variables} = profile;
    const {locale, sectionID} = this.props;

    if (value instanceof Array && !value.length) delete selectors[name];
    else selectors[name] = value;

    this.setState({loading: true, selectors});
    let url = `/api/profile?profile=${id}&locale=${locale}&${Object.entries(selectors).map(([key, val]) => `${key}=${val}`).join("&")}`;
    if (sectionID) url += `&section=${sectionID}`;
    const payload = {variables};
    axios.post(url, payload)
      .then(resp => {
        this.setState({profile: resp.data, loading: false});
      });
  }

  render() {
    const {profile, loading, modalSlug, isIE, setVarsLoading} = this.state;
    const {
      hideAnchor,   // strip out heading anchor link
      hideOptions,  // strip out visualization options buttons
      hideHero,     // strip out the hero section
      hideSubnav    // strip out the subnav
    } = this.props;

    if (!this.state.profile) return null;
    if (this.state.profile.error) return <div>{this.state.profile.error}</div>;

    let {sections} = profile;
    // Find the first instance of a Hero section (excludes all following instances)
    const heroSection = sections.find(l => l.type === "Hero");
    // Remove all heros & modals from sections.
    if (heroSection) sections = sections.filter(l => l.type !== "Hero");
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

    // To prevent a "loading flicker" when users call setVariables, normal Sections don't show a "Loading"
    // when the only thing that updated was from setVariables. HOWEVER, if this is a modal popover, we really
    // SHOULD wait if setVarsLoading is true, because the config might have called setVariables and then
    // called openModal right after, so let's wait for setVars to be done before we consider the loading complete.
    const modalSectionLoading = loading || setVarsLoading;

    const hideElements = {
      hideAnchor,
      hideOptions
    };

    return (
      <Fragment>
        <div className="cp">
          {!hideHero &&
            <Hero profile={profile} contents={heroSection || null} {...hideElements} />
          }

          {!hideSubnav &&
            <Subnav sections={groupedSections} />
          }

          {/* main content sections */}
          <main className="cp-main" id="main">
            {groupedSections.map((groupings, i) =>
              <div className="cp-grouping" key={i} style={isIE === true ? {
                position: "relative",
                zIndex: i + 1 // in IE, hide sticky sections behind the next grouping
              } : null}>
                {groupings.map((innerGrouping, ii) => innerGrouping.length === 1
                  // ungrouped section
                  ? <Section
                    contents={innerGrouping[0]}
                    onSetVariables={this.onSetVariables.bind(this)}
                    headingLevel={groupedSections.length === 1 || ii === 0 ? "h2" : "h3"}
                    loading={loading}
                    key={`${innerGrouping[0].slug}-${ii}`}
                    {...hideElements}
                  />
                  // grouped sections
                  : <SectionGrouping layout={innerGrouping[0].type}>
                    {innerGrouping.map((section, iii) =>
                      <Section
                        contents={section}
                        onSetVariables={this.onSetVariables.bind(this)}
                        headingLevel={groupedSections.length === 1 || ii === 0
                          ? iii === 0 ? "h2" : "h3"
                          : "h4"
                        }
                        loading={loading}
                        key={`${section.slug}-${iii}`}
                        {...hideElements}
                      />
                    )}
                  </SectionGrouping>
                )}
              </div>
            )}
          </main>

          {/* modal sections */}
          <Dialog
            className="cp-modal-section-dialog"
            portalClassName="cp-modal-section-portal"
            backdropClassName="cp-modal-section-backdrop"
            isOpen={modalSection}
            onClose={() => this.setState({modalSlug: null})}
          >
            <button className="cp-dialog-close-button" onClick={() => this.setState({modalSlug: null})} key="db">
              <Icon className="cp-dialog-close-button-icon" icon="cross" />
              <span className="u-visually-hidden">close section</span>
            </button>

            <Section
              contents={modalSection}
              loading={modalSectionLoading}
              onSetVariables={this.onSetVariables.bind(this)}
              key="ds"
              {...hideElements}
            />
          </Dialog>
        </div>

        <Mirror inUse="true" /> {/* for rendering visualization/section to save as image */}
      </Fragment>
    );
  }
}

ProfileRenderer.contextTypes = {
  router: PropTypes.object
};

ProfileRenderer.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  initialVariables: PropTypes.object,
  onSelector: PropTypes.func,
  onOpenModal: PropTypes.func
};

export default hot(ProfileRenderer);
