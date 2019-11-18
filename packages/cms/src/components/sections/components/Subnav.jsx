import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import {AnchorLink} from "@datawheel/canon-core";

import throttle from "../../../utils/throttle";
import stripHTML from "../../../utils/formatters/stripHTML";

import "./Subnav.css";

class Subnav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currSection: false,
      top: false,
      fixed: false
    };
    this.subnav = React.createRef();
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    if (!this.props.sections) return null;

    window.addEventListener("scroll", this.scrollBind);
    if (this.container) {
      this.setState({
        top: this.container.getBoundingClientRect().top + window.scrollY
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  /** unpack grouped sections from Profile.jsx, only using the first section in each grouping */
  flattenSections(sections) {
    let flattenedSections = sections;
    if (sections &&
      Array.isArray(sections) &&
      sections[0] && sections[0][0] &&
      sections[0][0] === Object(sections[0][0])
    ) {
      flattenedSections = sections.map(s => s[0][0]);
    }
    return flattenedSections;
  }

  /** on scroll, determine whether subnav is fixed, and which section we're in */
  handleScroll() {
    const sections = this.flattenSections(this.props.sections);

    if (sections) {
      throttle(() => {
        const {currSection, fixed} = this.state;

        // determine whether
        let newFixed = fixed;
        const subnav = this.subnav.current;
        newFixed = subnav.getBoundingClientRect().top <= 0;
        // return window.innerHeight < window.scrollY;

        let newSection = false;
        sections.forEach(section => {
          const elem = document.getElementById(section.slug);
          const top = elem ? elem.getBoundingClientRect().top : 1;
          if (top <= 0) newSection = section;
        });

        if (newSection) {
          (newSection.sections || []).forEach(section => {
            const elem = document.getElementById(this.getProps(section).slug);
            const top = elem ? elem.getBoundingClientRect().top : 1;
            if (top <= 0) newSection = this.getProps(section).slug;
          });
          newSection = newSection.slug;
        }

        if (fixed !== newFixed || currSection !== newSection) {
          this.setState({
            fixed: newFixed,
            currSection: newSection
          });
        }
      });
    }
  }

  getProps(section) {
    let comp = section;
    if (comp.component) comp = comp.component;
    if (comp.WrappedComponent) comp = comp.WrappedComponent;
    return Object.assign({}, comp.defaultProps || {}, comp.props || {}, section.props || {});
  }

  render() {
    const {children} = this.props;
    const {currSection, fixed} = this.state;
    const sections = this.flattenSections(this.props.sections);

    if (!sections || !Array.isArray(sections)) return null;

    return (
      <nav className={`subnav ${fixed ? "is-fixed" : "is-static"}`} ref={this.subnav}>
        {children}

        {sections.length ? <ol className="subnav-list" key="sections-list">
          {sections.map(section =>
            <li className="subnav-item" key={section.slug}>
              <AnchorLink
                className={`subnav-link ${currSection === section.slug ? "is-active" : "is-inactive"}`}
                to={section.slug}
              >
                {stripHTML(section.title)}
              </AnchorLink>
            </li>
          )}
        </ol> : ""}
      </nav>
    );
  }
}

export default hot(Subnav);
