/* eslint-disable react/no-array-index-key */
import React, {useState, useRef, useContext} from "react";
import {nest} from "d3-collection";

// import CustomSections from "CustomSections";
import {
  Flex, Anchor, Button, Title, Box
} from "@mantine/core";
import {IconLink} from "@tabler/icons-react";
import {useWindowEvent} from "@mantine/hooks";
import isIE from "../../utils/isIE.js";
// import throttle from "../../utils/throttle";
import pxToInt from "../../utils/formatters/pxToInt";
import toKebabCase from "../../utils/formatters/toKebabCase";

import Parse from "./components/Parse";
import Selector from "./components/Selector";

import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";

import Default from "./Default";
import Grouping from "./Grouping";
import SubGrouping from "./SubGrouping";
import MultiColumn from "./MultiColumn";
import SingleColumn from "./SingleColumn";
import Tabs from "./Tabs";
import ProfileContext from "../ProfileContext";
import {stripHTML} from "../../../utils.js";

// User must define custom sections in app/cms/sections, and export them from an index.js in that folder.

// used to construct component
// NOTE: should be every Component in `components/sections/` except for Section (i.e., this component) and Hero (always rendered separately)

// TODO:
// - On set variables and reset variables


const sectionTypes = {
  Default, Grouping, SubGrouping, MultiColumn, SingleColumn, Tabs // ...CustomSections
};

/** */
function Section({
  headingLevel, hideAnchor, hideOptions, isModal, contents, ...rest
}) {
  const ctx = useContext(ProfileContext);
  const {t, customSections} = ctx;
  const [loading] = useState(false);
  const [isStickyIE, setIsStickyIE] = useState(false);
  // const [selectors, setSelectors] = useState({});
  const [sources, setSources] = useState([]);
  // Snapshots of the variables that have been changed by onSetVariables
  // So we can reset these and only these to their original values.
  const [changedVariables, setChangedVariables] = useState({});
  const [showReset, setShowReset] = useState();

  const stickySection = contents.position === "sticky";

  const section = useRef();
  const height = section.current && section.current.getBoundingClientRect().height;

  /**
   * Sections has received an onSetVariables function from props. However, this Section needs to
   * keep track locally of what it has changed, so that when a "reset" button is clicked, it can set
   * the variables back to their original state. This local intermediary function, passed down via context,
   * is responsible for keeping track of that, then in turn calling the props version of the function.
   */

  // Note: this function gets passed Viz
  const onSetVariables = (newVariables, forceMats, isComparison) => {
    // eslint-disable-next-line react/destructuring-assignment
    const initialVariables = rest.initialVariables || ctx.initialVariables || {};
    const changedVariables = {};
    Object.keys(newVariables).forEach(key => {
      changedVariables[key] = initialVariables[key];
    });
    setChangedVariables(changedVariables);
    setShowReset(Object.keys(changedVariables).length > 0);
    if (rest.onSetVariables) rest.onSetVariables(newVariables, forceMats, isComparison);
  };

  const resetVariables = () => {
    const {comparison} = contents;
    if (rest.onSetVariables) rest.onSetVariables(changedVariables, false, comparison);
    setChangedVariables({});
    setShowReset(false);
  };

  const scrollHandler = () => {
    // TODO: test on IE with sticky section
    const currentSection = section.current;
    if (stickySection === true && isIE) {
      const containerTop = currentSection.getBoundingClientRect().top;
      // TODO: set this on Mantine theme object (maybe)
      // const screenTop = document.documentElement.scrollTop + pxToInt(styles["sticky-section-offset"] || "50px");
      const screenTop = document.documentElement.scrollTop + pxToInt("50px");
      if (screenTop !== containerTop) {
        if (containerTop < screenTop && !isStickyIE) {
          setIsStickyIE(true);
        }
        else if (containerTop > screenTop && isStickyIE) {
          setIsStickyIE(false);
        }
      }
    }
  };

  useWindowEvent("scroll", scrollHandler);

  const updateSource = newSources => {
    if (!newSources) {
      setSources([]);
    }
    else {
      setSources(oldSources => {
        const addSources = newSources
          .map(s => s.annotations)
        // filter out new sources that already are on the sources state variable.
          .filter(source =>
            source && source.source_name && !oldSources.find(s => s.source_name === source.source_name)
          );
        return [...oldSources, ...addSources];
      });
    }
  };
  const layout = contents.type;
  const layoutClass = `cp-${toKebabCase(layout)}-section`;


  const allSectionTypes = {...sectionTypes, ...customSections};
  const Layout = contents.position === "sticky" ? Default : allSectionTypes[layout] || Default;

  const showAnchor = !(isModal || hideAnchor);

  const {
    slug, title, descriptions, subtitles, visualizations
  } = contents;
  const selectors = contents.selectors || [];

  const filters = selectors.map(selector =>
    <Selector
      key={selector.id}
      // eslint-disable-next-line react/jsx-props-no-spreading
      isComparison={contents.comparison}
      {...selector}
      loading={loading}
      fontSize="xxs"
    />
  );

  const mainTitle =
    title &&
    <Title
      component={`${headingLevel}`}
      size={headingLevel}
      id={slug}
      className={`cp-section-heading ${layoutClass}-heading${layout !== "Hero" && showAnchor ? " cp-section-anchored-heading" : ""}`}
      sx={{
        "& .cp-heading-anchor": {
          visibility: "hidden"
        },
        "&:hover .cp-heading-anchor": {
          visibility: "visible"
        }
      }}
    >
      {stripHTML(title)}
      <Anchor href={`#${slug}`} ml="sm">
        <IconLink className="cp-heading-anchor" size="1.2rem"/>
      </Anchor>
    </Title>;

  const subTitle =
    contents.position !== "sticky" && subtitles.map((content, i) =>
      <Parse
        className={`cp-section-subhead display ${layoutClass}-subhead`}
        // eslint-disable-next-line react/no-array-index-key
        key={`${content.subtitle}-subhead-${i}`}
      >
        {content.subtitle}
      </Parse>
    )
  ;
  const heading =
    <>
      {mainTitle}
      {subTitle}
    </>
  ;

  let statContent;

  const {stats} = contents;
  if (contents.position !== "sticky") {
    const statGroups = nest().key(d => d.title).entries(stats);

    if (stats.length > 0) {
      statContent =
        <Flex
          sx={{
            "& > *": {
              flex: "1 0 50%"
            }
          }}
          className={`cp-stat-group-wrapper${stats.length === 1 ? " single-stat" : ""}`}
          wrap="wrap"
        >
          {statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />)}
        </Flex>
      ;
    }
  }
  let paragraphs;

  if (descriptions.length && contents.position !== "sticky") {
    paragraphs = descriptions.map((content, i) =>
      <Parse
        className={`cp-section-paragraph ${layoutClass}-paragraph`}
        key={`${content.description}-paragraph-${i}`}
      >
        {content.description}
      </Parse>
    );
  }

  const sourceContent = <SourceGroup sources={sources} />;

  const resetButton = showReset &&

      <Button
        onClick={resetVariables}
        className={`cp-var-reset-button ${layoutClass}-var-reset-button`}
        fontSize="xs"
        icon="undo"
        iconPosition="left"
        key="var-reset-button"
      >
        {t("CMS.Section.Reset visualizations")}
      </Button>
      ;

  const componentProps = {
    slug,
    title,
    heading,
    mainTitle,
    subTitle,
    filters,
    stats: statContent,
    sources: sourceContent,
    paragraphs: layout === "Tabs" ? contents.descriptions : paragraphs,
    resetButton,
    visualizations: contents.position !== "sticky" ? visualizations : [],
    vizHeadingLevel: `h${parseInt(headingLevel.replace("h", ""), 10) + 1}`,
    hideOptions,
    loading,
    contents,
    updateSource,
    onSetVariables
  };

  return (
    <Box
      className={`cp-section cp-${toKebabCase(contents.type)}-section${
        contents.position === "sticky" ? " is-sticky" : ""
      }${
        isStickyIE ? " ie-is-stuck" : ""
      }${
        isModal ? " cp-modal-section" : ""
      }`}
      ref={section}
      id={`cp-section-${contents.id}`}
      key={`cp-section-${contents.id}`}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Layout {...componentProps} />

      {/* in IE, create empty div set to the height of the stuck element */}
      {isStickyIE &&
        <>
          <div className="ie-sticky-spacer" style={{height}} />
          <div className="ie-sticky-section-color-fixer" />
        </>
      }
    </Box>
  );
}

export default Section;
