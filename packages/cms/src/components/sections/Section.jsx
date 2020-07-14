import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {AnchorLink} from "@datawheel/canon-core";

import styles from "style.yml";
import isIE from "../../utils/isIE.js";
import throttle from "../../utils/throttle";
import pxToInt from "../../utils/formatters/pxToInt";
import toKebabCase from "../../utils/formatters/toKebabCase";

import Button from "../fields/Button";

import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";

import Parse from "./components/Parse";
import Selector from "./components/Selector";

import Default from "./Default";
import Grouping from "./Grouping";
import MultiColumn from "./MultiColumn";
import SingleColumn from "./SingleColumn";
import Tabs from "./Tabs";

// User must define custom sections in app/cms/sections, and export them from an index.js in that folder.
import * as CustomSections from "CustomSections";

// used to construct component
// NOTE: should be every Component in `components/sections/` except for Section (i.e., this component) and Hero (always rendered separately)
const sectionTypes = {Default, Grouping, MultiColumn, SingleColumn, Tabs, ...CustomSections};

/** wrapper for all sections */
class Section extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      isStickyIE: false,
      selectors: {},
      sources: [],
      // Snapshots of the variables that have been changed by onSetVariables
      // So we can reset these and only these to their original values.
      changedVariables: {},
      showReset: false
    };

    // used for IE sticky fallback
    this.section = React.createRef();
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const stickySection = this.state.contents.position === "sticky";
    const currentSection = this.section.current;

    // make sure the section is sticky
    if (stickySection === true && typeof window !== "undefined") {
      window.addEventListener("scroll", this.scrollBind);
      this.setState({
        // combine the position
        top: currentSection.getBoundingClientRect().top + document.documentElement.scrollTop,
        height: currentSection.getBoundingClientRect().height
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.contents) !== JSON.stringify(this.props.contents)) {
      this.setState({contents: this.props.contents});
      this.updateSource.bind(this)(false);
    }
  }

  updateSource(newSources) {
    if (!newSources) this.setState({sources: []});
    else {
      const {sources} = this.state;
      newSources
        .map(s => s.annotations)
        .forEach(source => {
          if (source && source.source_name && !sources.find(s => s.source_name === source.source_name)) sources.push(source);
        });
      this.setState({sources});
    }
  }

  /**
   * Sections may be embedded as part of a Front-end Profile OR as a previewed section in the CMS. As a front-end
   * Profile, formatters and variables come in through context, and as a CMS Preview these come through as props.
   * (This is similar to Viz.jsx which can also be expressed as a front-end component or a CMS preview)
   */
  getChildContext() {
    return {
      formatters: this.props.formatters || this.context.formatters,
      variables: this.props.variables || this.context.variables,
      onSetVariables: this.onSetVariables.bind(this),
      updateSource: this.updateSource.bind(this)
    };
  }

  /**
   * Sections has received an onSetVariables function from props. However, this Section needs to
   * keep track locally of what it has changed, so that when a "reset" button is clicked, it can set
   * the variables back to their original state. This local intermediary function, passed down via context,
   * is responsible for keeping track of that, then in turn calling the props version of the function.
   */
  onSetVariables(newVariables) {
    const initialVariables = this.props.initialVariables || this.context.initialVariables || {};
    const changedVariables = {};
    Object.keys(newVariables).forEach(key => {
      changedVariables[key] = initialVariables[key];
    });
    this.setState({
      changedVariables,
      showReset: Object.keys(changedVariables).length > 0
    });
    if (this.props.onSetVariables) this.props.onSetVariables(newVariables);
  }

  /**
   * When the user clicks reset, take the snapshot of the variables they changed and use them to
   * revert only those variables via the props function.
   */
  resetVariables() {
    const {changedVariables} = this.state;
    if (this.props.onSetVariables) this.props.onSetVariables(changedVariables);
    this.setState({
      changedVariables: {},
      showReset: false
    });
  }

  handleScroll() {
    const stickySection = this.state.contents.position === "sticky";

    // make sure the current section is sticky & the document window exists
    if (stickySection === true && isIE) {
      const isStickyIE = this.state.isStickyIE;
      const containerTop = this.state.top;
      const screenTop = document.documentElement.scrollTop + pxToInt(styles["sticky-section-offset"] || "50px");

      throttle(() => {
        if (screenTop !== containerTop) {
          if (containerTop < screenTop && !isStickyIE) {
            this.setState({isStickyIE: true});
          }
          else if (containerTop > screenTop && isStickyIE) {
            this.setState({isStickyIE: false});
          }
        }
      });
    }
  }

  render() {
    const {contents, sources, isStickyIE, height, showReset} = this.state;
    const {headingLevel, hideAnchor, hideOptions, isModal, loading} = this.props;
    const initialVariables = this.props.initialVariables || this.context.initialVariables || {};

    // remap old section names
    const layout = contents.type;
    const layoutClass = `cp-${toKebabCase(layout)}-section`;

    const Layout = contents.position === "sticky" ? Default : sectionTypes[layout] || Default; // assign the section layout component

    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    let showAnchor = true;
    if (isModal || hideAnchor) showAnchor = false;

    // heading & subhead(s)
    const mainTitle = <Fragment>
      {title &&
        <div className={`cp-section-heading-wrapper ${layoutClass}-heading-wrapper`}>
          <Parse El={headingLevel} id={slug} className={`cp-section-heading ${layoutClass}-heading${layout !== "Hero" && showAnchor ? " cp-section-anchored-heading" : ""}`} tabIndex="0">
            {title}
          </Parse>
          {showAnchor &&
            <AnchorLink to={slug} className={`cp-section-heading-anchor ${layoutClass}-heading-anchor`}>
              #<span className="u-visually-hidden">permalink to section</span>
            </AnchorLink>
          }
        </div>
      }
    </Fragment>;

    const subTitle = <Fragment>
      {contents.position !== "sticky" && subtitles.map((content, i) =>
        <Parse className={`cp-section-subhead display ${layoutClass}-subhead`} key={`${content.subtitle}-subhead-${i}`}>
          {content.subtitle}
        </Parse>
      )}
    </Fragment>;

    const heading = <Fragment>
      {mainTitle}
      {subTitle}
    </Fragment>;

    // filters
    const filters = selectors.map(selector =>
      <Selector
        key={selector.id}
        {...selector}
        loading={loading}
        fontSize="xxs"
      />
    );

    // stats
    let statContent;

    if (contents.position !== "sticky") {
      const statGroups = nest().key(d => d.title).entries(stats);

      if (stats.length > 0) {
        statContent = <div className={`cp-stat-group-wrapper${stats.length === 1 ? " single-stat" : ""}`}>
          {statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />)}
        </div>;
      }
    }

    // paragraphs
    let paragraphs;

    if (descriptions.length && contents.position !== "sticky") {
      paragraphs = descriptions.map((content, i) =>
        <Parse className={`cp-section-paragraph ${layoutClass}-paragraph`} key={`${content.description}-paragraph-${i}`}>
          {content.description}
        </Parse>
      );
    }

    // sources
    const sourceContent = <SourceGroup sources={sources} />;

    // reset button
    const resetButton = <Button
      onClick={this.resetVariables.bind(this)}
      className={`cp-var-reset-button ${layoutClass}-var-reset-button`}
      fontSize="xs"
      icon="undo"
      iconPosition="left"
      disabled={!showReset}
      fill={!showReset}
      key="var-reset-button"
    >
      Reset visualizations
    </Button>;

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
      contents
    };

    return (
      <Fragment>
        <section
          className={`cp-section cp-${toKebabCase(contents.type)}-section${
            contents.position === "sticky" ? " is-sticky" : ""
          }${
            isStickyIE ? " ie-is-stuck" : ""
          }${
            isModal ? " cp-modal-section" : ""
          }`}
          ref={this.section}
          key={`section-${contents.id}`}
        >
          <Layout {...componentProps} />
        </section>

        {/* in IE, create empty div set to the height of the stuck element */}
        {isStickyIE ? <Fragment>
          <div className="ie-sticky-spacer" style={{height}} />
          <div className="ie-sticky-section-color-fixer" />
        </Fragment> : ""}
      </Fragment>
    );
  }
}

Section.defaultProps = {
  headingLevel: "h2"
};

Section.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object,
  initialVariables: PropTypes.object
};

Section.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object,
  onSetVariables: PropTypes.func,
  updateSource: PropTypes.func
};

export default connect(state => ({
  locale: state.i18n.locale
}))(Section);
