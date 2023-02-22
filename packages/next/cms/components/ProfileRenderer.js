/* eslint-disable require-jsdoc */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
/*
 TODO:
   - [ ] port remaining sections/code
   - [ ] port styles to Mantine/theme
   - [ ] User Re-auth/populate
   - [ ] CustomSections
   - [ ] test/enable comparison mode
   - [ ] test/enable PDF printing
*/

import {useEffect, useMemo, useState} from "react";
// import axios from "axios";
import {useRouter} from "next/router";
import {assign} from "d3plus-common";
import {Container} from "@mantine/core";
// eslint-disable-next-line import/no-cycle
import {Hero, ProfileContext} from "../..";

// import {Button, Dialog, Icon} from "@blueprintjs/core";

import Section from "./sections/Section";
import Related from "./sections/Related";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";
import mortarEval from "../utils/mortarEval";
import deepClone from "../utils/deepClone";
import prepareProfile from "../utils/prepareProfile";
import funcifyFormatterByLocale from "../utils/funcifyFormatterByLocale";

// TODO
// User must define custom sections in app/cms/sections, and export them from an index.js in that folder.
// import * as CustomSections from "CustomSections";

// TODO
// const comparisonsEnabled = process.env.NEXT_PUBLIC_PROFILE_COMPARISON;
// const comparisonExclude = process.env.NEXT_PUBLIC_PROFILE_COMPARISON_EXCLUDE;

const splitComparisonKeys = obj => {
  const split = {
    profile: {},
    comparison: {}
  };
  Object.keys(obj).forEach(k => {
    split[k.startsWith("compare_") ? "comparison" : "profile"][k.replace("compare_", "")] = obj[k];
  });
  return split;
};

function ProfileRenderer({
  formatters,
  hideAnchor, // strip out heading anchor link
  hideOptions, // strip out visualization options buttons
  hideHero, // strip out the hero section
  hideSubnav, // strip out the subnav
  profile: rawProfile,
  linkify = profile => profile.reduce(
    (href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`,
    "/profile"
  ),
  searchProps = {},
  t
}) {
  const router = useRouter();
  const {locale, query} = router;

  const defaultSelectors = {...router.query};
  delete defaultSelectors.compare;
  delete defaultSelectors.print;

  const [profile, setProfile] = useState(rawProfile);
  const [selectors, setSelectors] = useState(defaultSelectors);
  const [modalSlug, setModalSlug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setVarsLoading, setSetVarsLoading] = useState(false);
  const [comparison, setComparison] = useState(false);
  // const [comparisonLoading, setComparisonLoading] = useState(false);
  // const [comparisonSearch, setComparisonSearch] = useState(false);

  // Set initial state to fix propify error on first render
  const initialVariables = useMemo(() => deepClone(profile.variables), []);
  const formatterFunctions = useMemo(() => funcifyFormatterByLocale(formatters, locale), [locale]);

  const print = query.print === "true";

  // TODO
  // useEffect(() => {
  //   if (router.query.compare) addComparison(router.query.compare);
  // }, []);

  useEffect(() => {
    const {variables} = profile;
    const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, selectors);
    setProfile(profile => ({...profile, ...newProfile}));
  }, [router.path]);


  // TODO
  // useEffect(() => {
  //   const {user} = auth;
  //   const userRole = user.role;
  //   onSetVariables({user, userRole}, true);
  // }, [user]);

  /**
   * Visualizations have the ability to "break out" and override a variable in the variables object.
   * This requires re-running materializers, because the user may have changed a variable
   * that would affect the "allowed" status of a given section.
   */
  const onSetVariables = (newVariables, forceMats, isComparison) => {
    const compVars = comparison.variables;

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
        const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, selectors);
        setProfile({...profile, ...newProfile});
      }
      else {
        // If forceMats is not true, no materializers required. Using the locally stored _rawProfile and the now-combined
        // old and new variables, you have all that you need to make the profile update.
        const split = splitComparisonKeys(selectors);
        if (isComparison) {
          const newComparison = prepareProfile(
            compVars._rawProfile,
            {...compVars, ...newVariables},
            formatterFunctions,
            locale,
            split.comparison
          );
          setComparison({...comparison, ...newComparison});
        }
        else {
          const newProfile = prepareProfile(
            variables._rawProfile,
            {...variables, ...newVariables},
            formatterFunctions,
            locale,
            split.profile
          );
          setProfile({...profile, ...newProfile});
        }
      }
    }
  };

  const updateQuery = () => {

  };

  useEffect(() => updateQuery, [JSON.stringify(selectors)]);

  const onSelector = (name, value, isComparison) => {
    const newSelectors = {...selectors};

    newSelectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    const split = splitComparisonKeys(newSelectors);

    const {variables} = profile;
    const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, split.profile);

    if (comparison) {
      const compVars = comparison.variables;
      const newComp = prepareProfile(compVars._rawProfile, compVars, formatterFunctions, locale, split.comparison);
      setComparison({...comparison, ...newComp});
    }

    setSelectors(newSelectors);
    setProfile({...profile, ...newProfile});

    // // updateQuery:
    // const newQuery = {...query, ...newSelectors};

    // if (comparison) newQuery.compare = comparison.dims[0].memberSlug;
    // else delete newQuery.compare;

    // router.replace({query: newQuery}, undefined, {shallow: true});

  };

  const onTabSelect = (id, index) => {
    const newSelectors = {...selectors};
    newSelectors[`tabsection-${id}`] = index;
    // updateQuery as callback don't work. TODO: refactor
    setSelectors(newSelectors);
  };

  /**
   * Single entity profiles (not bivariate) can enable the option to add
   * a comparitor entity to view every profile section for those two selected
   * entities side-by-side. This function loads the necessary data into state
   * for comparison profiles and updates the "compare" query arg in the URL
   * based on a provided memberSlug.
   */
  // const addComparison = (memberSlug) => {

  //   const slug = profile.meta[0].slug;

  //   setComparison(false);
  //   setComparisonLoading(true);
  //   setComparisonSearch(false);

  //   axios.get(`/api/profile?slug=${slug}&id=${memberSlug}&locale=${locale}`)
  //     .then(resp => resp.data)
  //     .then(comparison => {

  //       if (Object.keys(selectors).length) {
  //         const compVars = comparison.variables;
  //         const split = splitComparisonKeys(selectors);
  //         const newComp = prepareProfile(compVars._rawProfile, compVars, formatterFunctions, locale, split.comparison);
  //         comparison = {...comparison, ...newComp};
  //       }

  //       setComparison(comparison);
  //       setComparisonLoading(false);

  //     });

  // }

  /**
   * Removes any loaded comparison data, as well as resets the URL to
   * the that of the base profile.
   */
  // const removeComparison = () => {
  //   setComparison(comparison, this.updateQuery);
  // }

  /**
   * Toggles the visibility and focus of a ProfileSearch component
   * used in the Hero to select a comparitor profile.
   */
  // const toggleComparisonSearch = () => {

  //   if (!comparisonSearch) {
  //     setTimeout(() => {
  //       document.querySelector(".cp-comparison-search-container .cp-input").focus();
  //     }, 300);
  //   }

  //   setComparisonSearch(!comparisonSearch);

  // }

  // If a comparison profile is loading, render the
  // site's default Loading component.
  // if (comparisonLoading) return <Loading />;

  // The "Add Comparison" search button that gets added to the Hero section
  // if comparisons are enabled, the profile is not bi-lateral, and there
  // is currently no comparitor.
  // const exclude = comparisonExclude && typeof comparisonExclude === "string" && comparisonExclude.split(",").includes(profile.dims[0].slug);
  // const comparisonButton = comparisonsEnabled && !exclude && profile.dims.length === 1 && !comparison
  //   ? <div className="cp-comparison-add">
  //     { comparisonSearch ? <div className="cp-comparison-search-container"
  //       style={{
  //         display: "inline-block",
  //         marginRight: 10,
  //         maxWidth: 300
  //       }}>
  //       <ProfileSearch
  //         defaultProfiles={`${profile.id}`}
  //         filters={false}
  //         inputFontSize="md"
  //         display="list"
  //         position="absolute"
  //         renderListItem={(result, i, link, title, subtitle) =>
  //           result[0].id === profile.variables.id
  //             ? null
  //             : <li key={`r-${i}`} className="cms-profilesearch-list-item">
  //               <span onClick={addComparison result[0].memberSlug)} className="cms-profilesearch-list-item-link">
  //                 {title}
  //                 <div className="cms-profilesearch-list-item-sub u-font-xs">{subtitle}</div>
  //               </span>
  //             </li>
  //         }
  //         showExamples={true}
  //         {...searchProps} />
  //     </div> : null }
  //     <Button icon={comparisonSearch ? "cross" : "comparison"} onClick={this.toggleComparisonSearch.bind(this)}>
  //       {comparisonSearch ? null : t("CMS.Profile.Add Comparison")}
  //     </Button>
  //   </div>
  //   : null;

  let sections = profile.sections.map(s => assign({}, s));
  // Find the first instance of a Hero section (excludes all following instances)
  const heroSection = sections.find(l => l.type === "Hero");
  // Remove all heros & modals from sections.
  sections = sections
    .filter(l => l.type !== "Hero" && l.position !== "modal");

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
          : rawSection.title.replace(/<\/p>$/g, ` - ${payload.variables.name}</p>`)

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
      const groupableSections = ["SingleColumn"]; // sections to be grouped together
      // const groupableSections = ["SingleColumn"].concat(Object.keys(CustomSections)); // sections to be grouped together

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
          else {
            // otherwise, push the section as-is
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

  // TODO
  // if (print) {
  //   const index = sections.length + 1;
  //   const groupingStubSection = {
  //     allowed: "always",
  //     descriptions: [
  //       {
  //         description: `<p>${t("CMS.Profile.Data Appendix Description")}</p>`
  //       }
  //     ],
  //     icon: "",
  //     id: "data-appendix-group",
  //     ordering: index,
  //     position: "default",
  //     profile_id: 1,
  //     selectors: [],
  //     short: "",
  //     slug: "data-appendix",
  //     stats: [],
  //     subtitles: [],
  //     title: `<p>${t("CMS.Profile.Data Appendix")}</p>`,
  //     type: "Grouping",
  //     visualizations: []
  //   };
  //   const printSections = sections
  //     .filter(d => d.visualizations.length > 0)
  //     .map(d => [{
  //       ...d,
  //       id: `data-appendix-${d.id}`,
  //       ordering: index,
  //       descriptions: [],
  //       selectors: [],
  //       stats: [],
  //       subtitles: [],
  //       position: "default",
  //       type: "SingleColumn",
  //       configOverride: {
  //         columns: arr => arr.filter(d => !d.includes("ID ") && !d.includes("Slug ")),
  //         title: false,
  //         type: "Table",
  //         defaultPageSize: Number.MAX_VALUE,
  //         showPagination: false,
  //         minRows: 0
  //       }
  //     }]);
  //   groupedSections.push([[groupingStubSection], ...printSections]);
  // }

  // const modalSection = modalSlug ? profile.sections.find(s => s.slug === modalSlug) : null;

  // To prevent a "loading flicker" when users call setVariables, normal Sections don't show a "Loading"
  // when the only thing that updated was from setVariables. HOWEVER, if this is a modal popover, we really
  // SHOULD wait if setVarsLoading is true, because the config might have called setVariables and then
  // called openModal right after, so let's wait for setVars to be done before we consider the loading complete.
  // const modalSectionLoading = loading || setVarsLoading;

  const hideElements = {
    hideAnchor,
    hideOptions,

    // hides PDF buttons and clickable titles when in comparison mode
    hidePDF: comparison,
    hideTitleSearch: comparison
  };

  const relatedProfiles = profile.neighbors;
  const {variables} = profile;
  // Don't wrap into useMemo yet!
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context = {
    formatters: formatterFunctions,
    onSelector,
    onOpenModal: setModalSlug,
    onTabSelect,
    comparison,
    selectors,
    compVariables: comparison ? comparison.variables : {},
    variables,
    initialVariables,
    searchProps,
    print,
    linkify,
    t
  };

  return (
    <ProfileContext.Provider value={context}>
      <div className={`cp${print ? " cp-print" : ""}`}>

        { !hideHero
          ? <div
            className={`cp-hero-group ${comparison ? "comparison" : ""}`}
            style={{
              display: "flex",
              flexWrap: "nowrap"
            }}
          >
            <Hero
              key="cp-hero"
              profile={profile}
              contents={heroSection || null}
              // comparisonButton={comparisonButton}
              {...hideElements}
            />
            {/* { comparison ? <Hero
            key="cp-hero-comparison"
            profile={comparison}
            contents={comparison.sections.find(l => l.type === "Hero") || null}
            {...hideElements}
          /> : null } */}
          </div>
          : null }

        {!hideSubnav && <Subnav sections={groupedSections} />}

        <Container className="cp-main" id="main" fluid px="xl">
          {(comparisonSections.length ? comparisonSections : groupedSections).map((groupings, i) =>
            <div className={`cp-grouping${comparisonSections.length ? " cp-grouping-comparison" : ""}`} key={i}>
              {groupings.map((innerGrouping, ii) => innerGrouping.length === 1
                // ungrouped section
                ? <Section
                  contents={innerGrouping[0]}
                  onSetVariables={onSetVariables}
                  headingLevel={groupedSections.length === 1 || ii === 0
                    ? "h2"
                    : groupings.find(g => g[0].type.toLowerCase() === "subgrouping") &&
                      innerGrouping[0].type.toLowerCase() !== "subgrouping" ? "h4"
                      : "h3"}
                  loading={loading}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${innerGrouping[0].slug}-${innerGrouping[0].id}`}
                  {...hideElements}
                />

                : <SectionGrouping key={innerGrouping[0].slug} layout={innerGrouping[0].type}>
                  {innerGrouping.map((section, iii) =>
                    <Section
                      contents={section}
                      onSetVariables={onSetVariables}
                      headingLevel={groupedSections.length === 1 || ii === 0
                        ? "h2"
                        : groupings.find(g => g[0].type.toLowerCase() === "subgrouping") &&
                            innerGrouping[0].type.toLowerCase() !== "subgrouping" ? "h4"
                          : "h3"}
                      loading={loading}
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${section.slug}`}
                      {...hideElements}
                    />
                  )}
                </SectionGrouping>
              )}
            </div>
          )}
          {!hideHero && !print && relatedProfiles && relatedProfiles.length > 0 &&
            <Related profiles={relatedProfiles} />}
        </Container>

        {/* TODO: modal sections */}
        {/* <Dialog
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
            onSetVariables={onSetVariables}
            key="ds"
            {...hideElements}
          />
        </Dialog> */}
      </div>

      {/* TODO: fixed "Remove Comparison" button that appears when there is a comparison */}
      {/* {comparison ? <Button
        className="cp-comparison-remove"
        icon="cross"
        fill={true}
        onClick={this.removeComparison.bind(this)}
        style={{
          bottom: 0,
          position: "fixed",
          zIndex: 10
        }}>{t("CMS.Profile.Remove Comparison")}</Button> : null} */}

      {/* hidden DOM element for rendering visualization/section to save as image */}
      <Mirror inUse />

    </ProfileContext.Provider>
  );
}

export default ProfileRenderer;
