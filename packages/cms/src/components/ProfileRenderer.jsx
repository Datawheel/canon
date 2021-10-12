import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import React, {Component, Fragment} from "react";
import {isAuthenticated} from "@datawheel/canon-core";
import PropTypes from "prop-types";
import {Dialog, Icon} from "@blueprintjs/core";

import Hero from "./sections/Hero";
import Section from "./sections/Section";
import Related from "./sections/Related";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";
import isIE from "../utils/isIE.js";
import mortarEval from "../utils/mortarEval";
import deepClone from "../utils/deepClone.js";
import prepareProfile from "../utils/prepareProfile";
import funcifyFormatterByLocale from "../utils/funcifyFormatterByLocale";

// User must define custom sections in app/cms/sections, and export them from an index.js in that folder.
import * as CustomSections from "CustomSections";

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
      setVarsLoading: false,
      formatterFunctions: funcifyFormatterByLocale(props.formatters, props.locale)
    };
  }

  componentDidMount() {
    if (!this.props.auth.user) {
      this.props.isAuthenticated();
    }
    // If the component is mounting and we already have a user, then this pageload is coming from a react-router link.
    // The credentials for the user must be folded in to the variables payload (similar to initial login in componentDidUpdate)
    else {
      const {user} = this.props.auth;
      const userRole = user.role;
      this.onSetVariables.bind(this)({user, userRole}, true);
    }
    if (isIE) this.setState({isIE: true});
  }

  componentDidUpdate(prevProps) {
    const {isModal, sectionID} = this.props;
    if (!prevProps.auth.user && this.props.auth.user) {
      const {user} = this.props.auth;
      const userRole = user.role;
      this.onSetVariables.bind(this)({user, userRole}, true);
    }
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

    const {locale} = this.props;
    const {print, router} = this.context;
    const {profile, initialVariables, formatterFunctions} = this.state;
    const {variables} = profile;

    return {
      formatters: formatterFunctions,
      router,
      onSelector: this.onSelector.bind(this),
      onOpenModal: this.onOpenModal.bind(this),
      onTabSelect: this.onTabSelect.bind(this),
      variables,
      initialVariables,
      locale,
      print
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
   * This requires re-running materializers, because the user may have changed a variable
   * that would affect the "allowed" status of a given section.
   */
  onSetVariables(newVariables, forceMats) {
    const {profile, selectors, setVarsLoading, formatterFunctions} = this.state;
    const {id, variables} = profile;
    const {locale, sectionID} = this.props;
    const {params} = this.context.router;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(newVariables).every(key => variables[key] === newVariables[key]);
    if (!setVarsLoading && !alreadySet) {
      // If forceMats is true, this function has been called by the componentDidMount, and we must run materializers
      // so that variables like `isLoggedIn` can resolve to true.
      if (forceMats) {
        const combinedVariables = {...variables, ...newVariables};
        const matVars = variables._rawProfile.allMaterializers.reduce((acc, m) => {
          const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions, locale);
          if (typeof evalResults.vars !== "object") evalResults.vars = {};
          return {...acc, ...evalResults.vars};
        }, combinedVariables);
        const newProfile = prepareProfile(variables._rawProfile, matVars, formatterFunctions, locale, selectors);
        this.setState({profile: {...profile, ...newProfile}});
      }
      // If forceMats is not true, no materializers required. Using the locally stored _rawProfile and the now-combined
      // old and new variables, you have all that you need to make the profile update.
      else {
        const newProfile = prepareProfile(variables._rawProfile, Object.assign({}, variables, newVariables), formatterFunctions, locale, selectors);
        this.setState({profile: {...profile, ...newProfile}});
      }
    }
  }

  updateQuery(obj) {
    const {router} = this.context;
    const {location} = router;
    const {basename, pathname, query} = location;
    const newQuery = {...query, ...obj};
    const queryString = Object.entries(newQuery).map(([key, val]) => `${key}=${val}`).join("&");
    const newPath = `${basename}${pathname}?${queryString}`;
    if (queryString) router.replace(newPath);
  }

  onSelector(name, value) {
    const {profile, selectors, formatterFunctions} = this.state;
    const {variables} = profile;
    const {locale} = this.props;

    selectors[name] = value;

    this.updateQuery(selectors);

    const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, selectors);
    this.setState({selectors, profile: {...profile, ...newProfile}});
  }

  onTabSelect(id, index) {
    this.updateQuery({[`tabsection-${id}`]: index});
  }

  render() {
    const {profile, loading, modalSlug, isIE, setVarsLoading} = this.state;
    const {
      hideAnchor,   // strip out heading anchor link
      hideOptions,  // strip out visualization options buttons
      hideHero,     // strip out the hero section
      hideSubnav    // strip out the subnav
    } = this.props;
    const {print} = this.context;
    const {t} = this.props;

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
      if (l.type === "Column") l.type = "SingleColumn";
      if (!l.slug) l.slug = `section-${l.id}`;
    });

    const groupableSections = ["SingleColumn"].concat(Object.keys(CustomSections)); // sections to be grouped together
    const innerGroupedSections = []; // array for sections to be accumulated into
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

    if (print) {
      const index = sections.length + 1;
      const groupingStubSection = {
        allowed: "always",
        descriptions: [
          {
            description: `<p>${t("CMS.Profile.Data Appendix Description")}</p>`
          }
        ],
        icon: "",
        id: "data-appendix-group",
        ordering: index,
        position: "default",
        profile_id: 1,
        selectors: [],
        short: "",
        slug: "data-appendix",
        stats: [],
        subtitles: [],
        title: `<p>${t("CMS.Profile.Data Appendix")}</p>`,
        type: "Grouping",
        visualizations: []
      };
      const printSections = sections
        .filter(d => d.visualizations.length > 0)
        .map(d => [{
          ...d,
          id: `data-appendix-${d.id}`,
          ordering: index,
          descriptions: [],
          selectors: [],
          stats: [],
          subtitles: [],
          position: "default",
          type: "SingleColumn",
          configOverride: {
            columns: arr => arr.filter(d => !d.includes("ID ") && !d.includes("Slug ")),
            title: false,
            type: "Table",
            defaultPageSize: Number.MAX_VALUE,
            showPagination: false,
            minRows: 0
          }
        }]);
      groupedSections.push([[groupingStubSection], ...printSections]);
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

    const relatedProfiles = profile.neighbors;

    return (
      <Fragment>
        <div className={`cp${print ? " cp-print" : ""}`}>

          {!hideHero && <Hero key="cp-hero" profile={profile} contents={heroSection || null} {...hideElements} />}

          {!hideSubnav && <Subnav sections={groupedSections} />}

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
                    headingLevel={groupedSections.length === 1 || ii === 0
                      ? "h2"
                      : groupings.find(g => g[0].type.toLowerCase() === "subgrouping") &&
                        innerGrouping[0].type.toLowerCase() !== "subgrouping" ? "h4"
                        : "h3"}
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
                          ? "h2"
                          : groupings.find(g => g[0].type.toLowerCase() === "subgrouping") &&
                            innerGrouping[0].type.toLowerCase() !== "subgrouping" ? "h4"
                            : "h3"}
                        loading={loading}
                        key={`${section.slug}-${iii}`}
                        {...hideElements}
                      />
                    )}
                  </SectionGrouping>
                )}
              </div>
            )}
            {!hideHero && !print && relatedProfiles && relatedProfiles.length > 0 &&
              <Related profiles={relatedProfiles} />
            }
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
  router: PropTypes.object,
  print: PropTypes.bool
};

ProfileRenderer.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  initialVariables: PropTypes.object,
  onSelector: PropTypes.func,
  onOpenModal: PropTypes.func,
  onTabSelect: PropTypes.func,
  print: PropTypes.bool
};

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => dispatch(isAuthenticated())
});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(ProfileRenderer)
);
