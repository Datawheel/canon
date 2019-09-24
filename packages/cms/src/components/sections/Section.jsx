import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {nest} from "d3-collection";

import styles from "style.yml";
import throttle from "../../utils/throttle";
import pxToInt from "../../utils/formatters/pxToInt";
import toKebabCase from "../../utils/formatters/toKebabCase";

import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";

import Parse from "./components/Parse";
import Selector from "./components/Selector";

import Default from "./Default";
import Grouping from "./Grouping";
import InfoCard from "./InfoCard";
import MultiColumn from "./MultiColumn";
import SingleColumn from "./SingleColumn";
import Tabs from "./Tabs";

// used to construct component
// NOTE: should be every Component in `components/sections/` except for Section (i.e., this component) and Hero (always rendered separately)
const sectionTypes = {Default, Grouping, InfoCard, MultiColumn, SingleColumn, Tabs};

/** wrapper for all sections */
class Section extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      isStickyIE: false,
      selectors: {},
      sources: []
    };

    // used for IE sticky fallback
    this.section = React.createRef();
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const stickySection = this.state.contents.sticky;
    const currentSection = this.section.current;

    // make sure the section is sticky
    if (stickySection === true && typeof window !== "undefined") {
      // check for IE
      if (/*@cc_on!@*/false || !!document.documentMode) { // eslint-disable-line spaced-comment
        window.addEventListener("scroll", this.scrollBind);
        this.setState({
          // combine the position
          top: currentSection.getBoundingClientRect().top + document.documentElement.scrollTop,
          height: currentSection.getBoundingClientRect().height
        });
      }
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
          if (source.source_name && !sources.find(s => s.source_name === source.source_name)) sources.push(source);
        });
      this.setState({sources});
    }
  }

  getChildContext() {
    const {formatters, variables} = this.context;
    return {
      formatters,
      variables: this.props.variables || variables
    };
  }

  handleScroll() {
    const stickySection = this.state.contents.sticky;

    // make sure the current section is sticky & the document window exists
    if (stickySection === true && typeof window !== "undefined") {
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
    const {contents, sources, isStickyIE, height} = this.state;
    const {headingLevel, loading} = this.props;

    // remap old section names
    const layout = contents.type;
    const layoutClass = `cp-${toKebabCase(layout)}-section`;

    const Layout = contents.sticky ? Default : sectionTypes[layout] || Default; // assign the section layout component

    const {descriptions, slug, stats, subtitles, title, visualizations} = contents;
    const selectors = contents.selectors || [];

    // heading & subhead(s)
    const heading = <React.Fragment>
      {title &&
        <Parse El={headingLevel} id={ slug } className={`cp-section-heading ${layoutClass}-heading`}>
          {title}
        </Parse>
      }

      {!contents.sticky && subtitles.map((content, i) =>
        <Parse className={`cp-section-subhead display ${layoutClass}-subhead`} key={`${content.subtitle}-subhead-${i}`}>
          {content.subtitle}
        </Parse>
      )}
    </React.Fragment>;

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
    let statContent, secondaryStatContent;

    if (!contents.sticky) {
      const statGroups = nest().key(d => d.title).entries(stats);

      if (stats.length > 0) {
        statContent = <div className="cp-stat-group-wrapper">
          <div className="cp-stat-group">
            {statGroups.map(({key, values}, i) => !(layout === "InfoCard" && i > 0) // only push the first stat for cards
              ? <StatGroup key={key} title={key} stats={values} /> : ""
            )}
          </div>
        </div>;
      }
      if (stats.length > 1 && layout === "InfoCard") {
        secondaryStatContent = <div className="cp-stat-group-wrapper cp-secondary-stat-group-wrapper">
          <div className="cp-stat-group">
            {statGroups.map(({key, values}, i) => i > 0 // don't push the first stat again
              ? <StatGroup key={key} title={key} stats={values} /> : ""
            )}
          </div>
        </div>;
      }
    }

    // paragraphs
    let paragraphs;
    if (descriptions.length && !contents.sticky) {
      paragraphs = loading
        ? <p>Loading...</p>
        : descriptions.map((content, i) =>
          <Parse className={`cp-section-paragraph ${layoutClass}-paragraph`} key={`${content.description}-paragraph-${i}`}>
            {content.description}
          </Parse>
        );
    }

    // sources
    const sourceContent = <SourceGroup sources={sources} />;

    const componentProps = {
      slug,
      title,
      heading,
      filters,
      stats: statContent,
      secondaryStats: secondaryStatContent,
      sources: sourceContent,
      paragraphs: layout === "Tabs" ? contents.descriptions : paragraphs,
      visualizations: !contents.sticky ? visualizations : [],
      vizHeadingLevel: `h${parseInt(headingLevel.replace("h", ""), 10) + 1}`,
      loading
    };

    return (
      <React.Fragment>
        <section
          className={`cp-section cp-${toKebabCase(contents.type)}-section${
            contents.sticky ? " is-sticky" : ""
          }${
            isStickyIE ? " ie-is-stuck" : ""
          }`}
          ref={this.section}
          key={`section-${contents.id}`}
        >
          <Layout {...componentProps} />
        </section>

        {/* in IE, create empty div set to the height of the stuck element */}
        {isStickyIE ? <React.Fragment>
          <div className="ie-sticky-spacer" style={{height}} />
          <div className="ie-sticky-section-color-fixer" />
        </React.Fragment> : ""}
      </React.Fragment>
    );
  }
}

Section.defaultProps = {
  headingLevel: "h2"
};

Section.contextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object,
  variables: PropTypes.object
};

Section.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(Section);
