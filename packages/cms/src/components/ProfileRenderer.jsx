import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import React, {Component, Fragment} from "react";
import {isAuthenticated} from "@datawheel/canon-core";
import PropTypes from "prop-types";
import axios from "axios";
import {Button, Dialog, Icon} from "@blueprintjs/core";

import Loading from "$app/components/Loading";
import Hero from "./sections/Hero";
import Section from "./sections/Section";
import Related from "./sections/Related";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";
import ProfileSearch from "./fields/ProfileSearch";
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

const splitComparisonKeys = obj => {
  const split = {
    profile: {},
    comparison: {}
  };
  Object.keys(obj).forEach(k => {
    split
      [k.startsWith("compare_") ? "comparison" : "profile"]
      [k.replace("compare_", "")] =
    obj[k];
  });
  return split;
};

class ProfileRenderer extends Component {
  constructor(props) {
    super(props);
    const query = {...props.router.location.query};
    delete query.compare;
    this.state = {
      profile: props.profile,
      // Take a one-time, initial snapshot of the entire variable set at load time to be passed via context.
      // This is necessary because embedded sections need a pure untouched variable set, so they can reset
      // the variables they changed via setVariables back to the original state at load time.
      initialVariables: deepClone(props.profile.variables),
      selectors: query,
      modalSlug: null,
      loading: false,
      setVarsLoading: false,
      formatterFunctions: funcifyFormatterByLocale(props.formatters, props.locale),
      comparison: false,
      comparisonLoading: false,
      comparisonSearch: false
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

    // If there is no main profile error, and the URL contains a "compare" query
    // slug, run the addComparison function with this slug to load the initial
    // comparitor's data payload for rendering.
    if (!this.state.profile.error) {
      const {query} = this.context.router.location;
      if (query.compare) this.addComparison.bind(this)(query.compare);
    }

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
    const {comparison, profile, initialVariables, formatterFunctions} = this.state;
    const {variables} = profile;

    return {
      formatters: formatterFunctions,
      router,
      onSelector: this.onSelector.bind(this),
      onOpenModal: this.onOpenModal.bind(this),
      onTabSelect: this.onTabSelect.bind(this),
      variables,
      comparison,
      compVariables: comparison ? comparison.variables : {},
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
  onSetVariables(newVariables, forceMats, isComparison) {
    const {profile, selectors, setVarsLoading, formatterFunctions, comparison} = this.state;
    const {variables} = profile;
    const compVars = comparison.variables;
    const {locale} = this.props;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    // const alreadySet = Object.keys(newVariables).every(key => variables[key] === newVariables[key]);
    // *** removed alreadySet due to a bug with clicking the same country twice. TODO: revisit loop protection
    if (!setVarsLoading) {
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
        const split = splitComparisonKeys(selectors);
        if (isComparison) {
          const newComparison = prepareProfile(compVars._rawProfile, Object.assign({}, compVars, newVariables), formatterFunctions, locale, split.comparison);
          this.setState({comparison: {...comparison, ...newComparison}});
        }
        else {
          const newProfile = prepareProfile(variables._rawProfile, Object.assign({}, variables, newVariables), formatterFunctions, locale, split.profile);
          this.setState({profile: {...profile, ...newProfile}});
        }

      }
    }
  }

  updateQuery() {

    const {router} = this.context;
    const {location} = router;
    const {pathname, query} = location;

    const {comparison, selectors} = this.state;

    const newQuery = {...query, ...selectors};

    if (comparison) newQuery.compare = comparison.dims[0].memberSlug;
    else delete newQuery.compare;

    const queryString = Object.entries(newQuery).map(([key, val]) => `${key}=${val}`).join("&");
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`);

  }

  onSelector(name, value, isComparison) {

    const {comparison, profile, selectors, formatterFunctions} = this.state;
    const {locale} = this.props;

    selectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    const split = splitComparisonKeys(selectors);

    const {variables} = profile;
    const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, split.profile);
    const payload = {selectors, profile: {...profile, ...newProfile}};

    if (comparison) {
      const compVars = comparison.variables;
      const newComp = prepareProfile(compVars._rawProfile, compVars, formatterFunctions, locale, split.comparison);
      payload.comparison = {...comparison, ...newComp};
    }

    this.setState(payload, this.updateQuery);

  }

  onTabSelect(id, index) {
    const {selectors} = this.state;
    selectors[`tabsection-${id}`] = index;
    this.setState({selectors}, this.updateQuery);
  }

  /**
   * Single entity profiles (not bivariate) can enable the option to add
   * a comparitor entity to view every profile section for those two selected
   * entities side-by-side. This function loads the necessary data into state
   * for comparison profiles and updates the "compare" query arg in the URL
   * based on a provided memberSlug.
   */
  addComparison(memberSlug) {

    const {locale} = this.props;
    const slug = this.state.profile.meta[0].slug;

    this.setState({
      comparison: false,
      comparisonLoading: true,
      comparisonSearch: false
    });

    axios.get(`/api/profile?slug=${slug}&id=${memberSlug}&locale=${locale}`)
      .then(resp => {

        let comparison = resp.data;
        const {formatterFunctions, selectors} = this.state;

        if (Object.keys(selectors).length) {
          const compVars = comparison.variables;
          const split = splitComparisonKeys(selectors);
          const newComp = prepareProfile(compVars._rawProfile, compVars, formatterFunctions, locale, split.comparison);
          comparison = {...comparison, ...newComp};
        }

        this.setState({comparison, comparisonLoading: false}, this.updateQuery);

      });

  }

  /**
   * Removes any loaded comparison data, as well as resets the URL to
   * the that of the base profile.
   */
  removeComparison() {
    this.setState({comparison: false}, this.updateQuery);
  }


  /**
   * Toggles the visibility and focus of a ProfileSearch component
   * used in the Hero to select a comparitor profile.
   */
  toggleComparisonSearch() {

    const {comparisonSearch} = this.state;
    this.setState({comparisonSearch: !comparisonSearch});

    if (!comparisonSearch) {
      setTimeout(() => {
        document.querySelector(".cp-comparison-search-container .cp-input").focus();
      }, 300);
    }

  }

  render() {
    const {comparison, comparisonLoading, comparisonSearch, profile, loading, modalSlug, isIE, setVarsLoading} = this.state;
    const {
      hideAnchor,   // strip out heading anchor link
      hideOptions,  // strip out visualization options buttons
      hideHero,     // strip out the hero section
      hideSubnav    // strip out the subnav
    } = this.props;
    const {print, searchProps} = this.context;
    const {comparisonsEnabled, comparisonExclude, t} = this.props;

    if (!profile) return null;
    if (profile.error) return <div>{profile.error}</div>;

    // If a comparison profile is loading, render the
    // site's default Loading component.
    if (comparisonLoading) return <Loading />;

    // The "Add Comparison" search button that gets added to the Hero section
    // if comparisons are enabled, the profile is not bi-lateral, and there
    // is currently no comparitor.
    // const exclude = comparisonExclude
    const exclude = comparisonExclude && typeof comparisonExclude === "string" && comparisonExclude.split(",").includes(this.props.profile.dims[0].slug);
    const comparisonButton = comparisonsEnabled && !exclude && profile.dims.length === 1 && !comparison
      ? <div className="cp-comparison-add">
        { comparisonSearch ? <div className="cp-comparison-search-container"
          style={{
            display: "inline-block",
            marginRight: 10,
            maxWidth: 300
          }}>
          <ProfileSearch
            defaultProfiles={`${profile.id}`}
            filters={false}
            inputFontSize="md"
            display="list"
            position="absolute"
            renderListItem={(result, i, link, title, subtitle) =>
              result[0].id === profile.variables.id
                ? null
                : <li key={`r-${i}`} className="cms-profilesearch-list-item">
                  <span onClick={this.addComparison.bind(this, result[0].memberSlug)} className="cms-profilesearch-list-item-link">
                    {title}
                    <div className="cms-profilesearch-list-item-sub u-font-xs">{subtitle}</div>
                  </span>
                </li>
            }
            showExamples={true}
            {...searchProps} />
        </div> : null }
        <Button icon={comparisonSearch ? "cross" : "comparison"} onClick={this.toggleComparisonSearch.bind(this)}>
          {comparisonSearch ? null : t("CMS.Profile.Add Comparison")}
        </Button>
      </div>
      : null;

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

    let groupedSections = [];

    // create a separate "section" Array for comparison mode, because
    // "groupedSections" is used in places other than rendering, and
    // modifying its contents directly would cause things like the
    // SubNav to have incorrect titles and sections
    const comparisonSections = [];

    // make sure there are sections to loop through (issue #700)
    if (sections.length) {

      if (comparison) {

        // function used to clone and modify a raw "section" in order
        // to prep it to be viewed side-by-side with a comparitor section
        // with similar content
        const comparifySection = (rawSection, payload) => ({

          ...rawSection,

          comparison: payload === comparison,

          // suffix "id" and "slug" keys with "-compare" so that anchor looks do not clash
          id: payload === profile ? rawSection.id : `${rawSection.id}-compare`,
          slug: `${rawSection.slug || `section-${rawSection.id}`}${payload === comparison ? "-compare" : ""}`,

          // add member names to each section title to help
          // differentiate the two comparitors
          title: rawSection.title.includes(payload.variables.name)
            ? rawSection.title
            : rawSection.title.replace(/\<\/p\>$/g, ` - ${payload.variables.name}</p>`)

        });

        // utilizes the "groupedSections" methodology that places sections side-by-side,
        // as in the case of the "SingleColumn" layout. this reducer pairs up every base
        // profile section with it's comparitor section (if available) so that they are
        // rendered side-by-side
        groupedSections = sections
          .reduce((arr, rawSection) => {

            const comp = comparison.sections.find(s => s.id === rawSection.id);
            if (comp) {

              const section = comparifySection(rawSection, profile);
              const newComp = comparifySection(comp, comparison);
              comparisonSections.push([[section, newComp]]);

              if (arr.length === 0 || rawSection.type === "Grouping") arr.push([[rawSection]]);
              else arr[arr.length - 1].push([rawSection]);

            }

            return arr;

          }, [])
          .filter(arr => arr.length > 1 || arr[0][0].type !== "Grouping");

      }
      else {

        const groupableSections = ["SingleColumn"].concat(Object.keys(CustomSections)); // sections to be grouped together
        const innerGroupedSections = []; // array for sections to be accumulated into
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
      hideOptions,

      // hides PDF buttons and clickable titles when in comparison mode
      hidePDF: comparison,
      hideTitleSearch: comparison
    };

    const relatedProfiles = profile.neighbors;

    return (
      <Fragment>
        <div className={`cp${print ? " cp-print" : ""}`}>

          { !hideHero ? <div className={`cp-hero-group ${comparison ? "comparison" : ""}`}
            style={{
              display: "flex",
              flexWrap: "nowrap"
            }}>
            <Hero
              key="cp-hero"
              profile={profile}
              contents={heroSection || null}
              comparisonButton={comparisonButton}
              {...hideElements}
            />
            { comparison ? <Hero
              key="cp-hero-comparison"
              profile={comparison}
              contents={comparison.sections.find(l => l.type === "Hero") || null}
              {...hideElements}
            /> : null }
          </div> : null }

          {!hideSubnav && <Subnav sections={groupedSections} />}

          {/* main content sections */}
          <main className="cp-main" id="main">
            {(comparisonSections.length ? comparisonSections : groupedSections).map((groupings, i) =>
              <div className={`cp-grouping${comparisonSections.length ? " cp-grouping-comparison" : ""}`} key={i} style={isIE === true ? {
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

        {/* fixed "Remove Comparison" button that appears when there is a comparison */}
        {comparison ? <Button
          className="cp-comparison-remove"
          icon="cross"
          fill={true}
          onClick={this.removeComparison.bind(this)}
          style={{
            bottom: 0,
            position: "fixed",
            zIndex: 10
          }}>{t("CMS.Profile.Remove Comparison")}</Button> : null}

        {/* hidden DOM element for rendering visualization/section to save as image */}
        <Mirror inUse="true" />

      </Fragment>
    );
  }
}

ProfileRenderer.contextTypes = {
  router: PropTypes.object,
  print: PropTypes.bool,
  searchProps: PropTypes.object
};

ProfileRenderer.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  initialVariables: PropTypes.object,
  comparison: PropTypes.bool,
  compVariables: PropTypes.object,
  onSelector: PropTypes.func,
  onOpenModal: PropTypes.func,
  onTabSelect: PropTypes.func,
  print: PropTypes.bool
};

const mapStateToProps = state => ({
  auth: state.auth,
  comparisonsEnabled: state.env.PROFILE_COMPARISON,
  comparisonExclude: state.env.PROFILE_COMPARISON_EXCLUDE
});

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => dispatch(isAuthenticated())
});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(ProfileRenderer)
);
