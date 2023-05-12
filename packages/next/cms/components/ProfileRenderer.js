/* eslint-disable require-jsdoc */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */

import React, {useContext, useState} from "react";
import {useRouter} from "next/router.js";
import {Text, Button, Container, UnstyledButton} from "@mantine/core";
import {Hero, NonIdealState, ProfileContext} from "../..";
import {IconSquarePlus, IconSquareMinus} from "@tabler/icons-react";
import {useProfileSections, useReportState} from "../hooks";

import Section from "./sections/Section";
import Related from "./sections/Related";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";
import mortarEval from "../utils/mortarEval";
import deepClone from "../utils/deepClone";
import prepareProfile from "../utils/prepareProfile";

import ProfileSearch from "./fields/ProfileSearch";
import {useDisclosure} from "@mantine/hooks";


// TODO
// const comparisonsEnabled = process.env.NEXT_PUBLIC_PROFILE_COMPARISON;
// const comparisonExclude = process.env.NEXT_PUBLIC_PROFILE_COMPARISON_EXCLUDE;

const ComparisonButton = () => {
  const [comparisonSearch, comparisonSearchHandlers] = useDisclosure(false);
  const router = useRouter();
  const {pathname, query} = router;
  const {t, variables, compareSlug} = useContext(ProfileContext);

  const addComparison = slug => router.replace(
    {pathname,
      query: {
        ...query,
        compare: slug
      }
    },
    undefined,
    {shallow: true});

  const removeComparison = () => {
    const newQuery = {...query};
    delete newQuery.compare;
    router.replace(
      {pathname, query: newQuery},
      undefined,
      {shallow: true}
    );
  };
  const handleClick = compareSlug
    ? removeComparison
    : comparisonSearchHandlers.toggle;

  return <div className="cp-comparison-add">
    {
      comparisonSearch &&
    <div>
      <ProfileSearch
        t={t}
        display="list"
        renderListItem={(result, i, link, title, subtitle) =>
          result[0].id === variables.id
            ? null
            : <li key={`r-${i}`} className="cms-profilesearch-list-item">
              <UnstyledButton
                onClick={() => addComparison(result[0].memberSlug)}
                className="cms-profilesearch-list-item-link">
                {title}
                <Text size="xs" className="cms-profilesearch-list-item-sub">{subtitle}</Text>
              </UnstyledButton>
            </li>
        }
      />
    </div>
    }
    <Button
      onClick={handleClick}
      leftIcon={!compareSlug ? <IconSquarePlus size="0.8rem" /> : <IconSquareMinus size="0.8rem" />}
      size="xs"
      variant="light"
      compact>{t("CMS.Profile.Add Comparison")}</Button>
  </div>;
};
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
  profile: initialProfile,
  linkify = profile => profile.reduce(
    (href, member) => `${href}/${member.slug}/${member.memberSlug || member.id}`,
    "/profile"
  ),
  searchProps = {},
  customSections = {},
  t
}) {
  const router = useRouter();
  const {locale, query} = router;
  // const [profile, setProfile] = useState(initialProfile);
  const selectors = {...router.query};
  const [loading] = useState(false);
  const [setVarsLoading] = useState(false);
  const initialVariables = initialProfile.variables;
  const {profile, comparison, formatterFunctions, comparisonLoading, compareSlug, setProfile, setComparison} = useReportState(initialProfile, formatters);
  // Set initial state to fix propify error on first render

  // const formatterFunctions = useMemo(() => funcifyFormatterByLocale(formatters, locale), [formatters, locale]);

  const print = query.print === "true";

  const {heroSection, groupedSections, comparisonSections} =  useProfileSections(profile, comparison);

  if (comparisonLoading) return <NonIdealState />;

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


  const onSelector = (name, value, isComparison) => {

    const newSelectors = {...selectors};
    newSelectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    // updateQuery:
    const newQuery = {...query, ...newSelectors};

    // if (comparison) newQuery.compare = comparison.dims[0].memberSlug;
    // else delete newQuery.compare;
    router.replace({query: newQuery}, undefined, {shallow: true});

  };

  const onTabSelect = (id, index) => {
    const newSelectors = {...selectors};
    newSelectors[`tabsection-${id}`] = index;
    // updateQuery as callback don't work. TODO: refactor
    router.replace({query: newSelectors}, undefined, {shallow: true});
  };

  // create a separate "section" Array for comparison mode, because
  // "groupedSections" is used in places other than rendering, and
  // modifying its contents directly would cause things like the
  // SubNav to have incorrect titles and sections

  // make sure there are sections to loop through (issue #700)


  // TODO
  // Do print stuff

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
    meta: profile.meta,
    formatters: formatterFunctions,
    onSelector,
    onTabSelect,
    compareSlug,
    comparison,
    selectors,
    compVariables: comparison ? comparison.variables : {},
    variables,
    initialVariables,
    searchProps,
    print,
    linkify,
    customSections,
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
              comparisonButton={<ComparisonButton />}
              {...hideElements}
            />
            {
              comparison &&
              <Hero
                key="cp-hero-comparison"
                profile={comparison}
                contents={comparison.sections.find(l => l.type === "Hero") || null}
                {...hideElements}
              />
            }
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
                  {innerGrouping.map(section =>
                    <Section
                      contents={section}
                      onSetVariables={onSetVariables}
                      headingLevel={groupedSections.length === 1 || ii === 0
                        ? "h2"
                        : groupings.find(g => g[0].type.toLowerCase() === "subgrouping") &&
                            innerGrouping[0].type.toLowerCase() !== "subgrouping" ? "h4"
                          : "h3"}
                      loading={loading}
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
      </div>
      {/* hidden DOM element for rendering visualization/section to save as image */}
      <Mirror inUse />

    </ProfileContext.Provider>
  );
}

export default ProfileRenderer;
