import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import {AnchorLink} from "@datawheel/canon-core";

import throttle from "../../../utils/throttle";
import stripHTML from "../../../utils/formatters/stripHTML";

import "./Subnav.css";

class Subnav extends Component {

  constructor() {
    super();
    this.state = {
      currSection: false,
      top: false,
      fixed: false
    };
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

  handleScroll() {
    throttle(() => {
      const {sections} = this.props;
      const {currSection, fixed} = this.state;
      const {fixed: fixedProp} = this.props;
      let newfixed = fixedProp;
      if (typeof newfixed === "function") newfixed = newfixed.bind(this)();

      let newSection = false;
      sections.forEach(section => {
        const elem = document.getElementById(section[0][0][0].slug);
        const top = elem ? elem.getBoundingClientRect().top : 1;
        if (top <= 0) newSection = section;
      });

      if (newSection) {
        (newSection.sections || []).forEach(section => {
          const elem = document.getElementById(this.getProps(section[0][0][0]).slug);
          const top = elem ? elem.getBoundingClientRect().top : 1;
          if (top <= 0) newSection = this.getProps(section).slug;
        });
        newSection = newSection.slug;
      }

      if (fixed !== newfixed || currSection !== newSection) {
        this.setState({
          fixed: newfixed,
          currSection: newSection
        });
      }
    });
  }

  getProps(section) {
    let comp = section;
    if (comp.component) comp = comp.component;
    if (comp.WrappedComponent) comp = comp.WrappedComponent;
    return Object.assign({}, comp.defaultProps || {}, comp.props || {}, section.props || {});
  }

  render() {
    const {children, sections} = this.props;
    const {currSection, fixed} = this.state;

    if (!this.props.sections) return null;

    return (
      <nav
        className={`subnav ${fixed ? "is-fixed" : "is-static"}`}
        ref={comp => this.container = comp}
      >
        {children}

        {sections.length && <ol className="subnav-list" key="sections-list">
          {sections.map(section => section[0] && section[0][0] &&
            <li className="subnav-item" key={section[0][0].slug}>
              <AnchorLink
                className={`subnav-link ${currSection === section[0][0].slug ? "is-active" : "is-inactive"}`}
                to={section[0][0].slug}
              >
                {stripHTML(section[0][0].title)}
              </AnchorLink>
            </li>
          )}
        </ol>}
      </nav>
    );
  }
}

Subnav.defaultProps = {
  fixed() {
    if (!window) return false;
    const {sections} = this.props;
    if (sections && Array.isArray(sections) && sections.length) {
      const elem = document.getElementById(sections[0][0][0].slug);
      if (elem) return elem.getBoundingClientRect().top <= 0;
    }
    return window.innerHeight < window.scrollY;
  }
};

export default hot(Subnav);
