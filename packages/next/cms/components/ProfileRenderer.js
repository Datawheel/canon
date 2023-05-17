/* eslint-disable require-jsdoc */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */

import React, {useState} from "react";
import {useRouter} from "next/router.js";
import {Container} from "@mantine/core";
import {Hero, NonIdealState, ProfileContext} from "../..";
import {useProfileSections, useReportState, useOnSelector, useOnSetVariables, useOnTabSelect} from "../hooks";

import Section from "./sections/Section";
import Related from "./sections/Related";
import SectionGrouping from "./sections/components/SectionGrouping";
import Subnav from "./sections/components/Subnav";
import Mirror from "./Viz/Mirror";

import ComparisonButton from "./fields/ComparisonButton";

// TODO
// const comparisonsEnabled = process.env.NEXT_PUBLIC_PROFILE_COMPARISON;
// const comparisonExclude = process.env.NEXT_PUBLIC_PROFILE_COMPARISON_EXCLUDE;

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
  icons,
  searchProps = {},
  customSections = {},
  t
}) {

  const router = useRouter();
  const {query} = router;
  // use query string as single source of truth for selectors
  const selectors = {...router.query};

  const [loading] = useState(false);
  const initialVariables = initialProfile.variables;
  const profileState = useReportState(initialProfile, formatters);
  const {profile, comparison, formatterFunctions, comparisonLoading, compareSlug} = profileState;

  const print = query.print === "true";

  const {heroSection, groupedSections, comparisonSections} =  useProfileSections(profile, comparison);

  // construct callbacks
  const onSelector = useOnSelector(selectors, router);
  const {onSetVariables} = useOnSetVariables(profileState, selectors);
  const onTabSelect = useOnTabSelect(selectors, router);

  if (comparisonLoading) return <NonIdealState />;


  // TODO
  // Do print stuff
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
    icons,
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

        {!hideSubnav && <Subnav sections={groupedSections} icons={icons} />}

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
