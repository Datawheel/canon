import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import styles from "../../../app/style.yml";
import throttle from "../../utils/throttle";
import pxToInt from "../../utils/formatters/pxToInt";
import toKebabCase from "../../utils/formatters/toKebabCase";

import Default from "./Default";
import InfoCard from "./InfoCard";
import SingleColumn from "./SingleColumn";
import Tabs from "./Tabs";

// used to construct component
// NOTE: should be every Component in `components/sections/` except for Section (i.e., this component) and Hero (always rendered separately)
const sectionTypes = {Default, InfoCard, SingleColumn, Tabs};

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
          top: currentSection.getBoundingClientRect().top + window.scrollY + pxToInt(styles["nav-height"]),
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
      const screenTop = window.scrollY + pxToInt(styles["nav-height"]);

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
    const {loading} = this.props;

    // remap old section names
    let layout = contents.type;
    if (layout === "TextViz") layout = "Default";
    if (layout === "Card") layout = "InfoCard";

    const Comp = sectionTypes[layout] || Default;

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
          <Comp contents={contents} loading={loading} sources={sources} />
        </section>

        {/* in IE, create empty div set to the height of the stuck element */}
        {isStickyIE ? <div className="ie-sticky-spacer" style={{height}} /> : ""}
      </React.Fragment>
    );
  }
}

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
