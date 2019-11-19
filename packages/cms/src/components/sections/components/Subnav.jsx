import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import {AnchorLink} from "@datawheel/canon-core";

import throttle from "../../../utils/throttle";
import blueprintIcons from "../../../utils/blueprintIcons";
import pxToInt from "../../../utils/formatters/pxToInt";
import stripHTML from "../../../utils/formatters/stripHTML";

import styles from "style.yml";

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
    if (this.props.sections && typeof window !== "undefined") {
      window.addEventListener("scroll", this.scrollBind);
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

  /** crawl up the tree from the title and grab the section wrapper */
  getSectionWrapper(slug) {
    const section = document.getElementById(slug);
    return section.parentNode.parentNode.parentNode;
  }

  /** on scroll, determine whether subnav is fixed, and which section we're in */
  handleScroll() {
    const sections = this.flattenSections(this.props.sections);

    if (sections) {
      throttle(() => {
        const {currSection, fixed} = this.state;
        const screenTop = window.pageYOffset + pxToInt(styles["nav-height"] || "50px") * 2;
        const heroHeight = document.querySelector(".cp-hero").getBoundingClientRect().height;

        // determine whether subnav is fixed
        if (screenTop > heroHeight && !fixed) {
          this.setState({fixed: true});
        }
        else if (screenTop < heroHeight && fixed) {
          this.setState({fixed: false});
        }

        // deteremine which section we're in
        let newSection = false;
        sections.forEach(section => {
          const elem = this.getSectionWrapper(section.slug);
          const top = elem ? elem.getBoundingClientRect().top : 1;
          if (top <= pxToInt(styles["nav-height"] || "50px") * 2) {
            newSection = section;
          }
        });

        // update state only when changes detected
        if (currSection !== newSection) {
          this.setState({currSection: newSection});
        }
      }, 30);
    }
  }

  render() {
    const {children} = this.props;
    const {currSection, fixed} = this.state;
    const sections = this.flattenSections(this.props.sections);

    if (!sections || !Array.isArray(sections)) return null;

    let height = 50;
    if (typeof window !== "undefined" && this.subnav.current) {
      height = this.subnav.current.getBoundingClientRect().height;
    }

    return (
      <Fragment>
        <nav className={`cp-subnav ${fixed ? "is-fixed" : "is-static"}`} ref={this.subnav} key="s">
          {children}

          {sections.length ? <ol className="cp-subnav-list" key="l">
            {sections.map(section =>
              <li className="cp-subnav-item" key={section.slug}>
                <AnchorLink
                  className={`cp-subnav-link ${currSection.slug === section.slug ? "is-active" : "is-inactive"} ${sections.length >= 5 ? "u-font-xs" : "u-font-sm" }`}
                  to={section.slug}
                >
                  {section.icon && blueprintIcons.find(i => i === section.icon) &&
                    <Icon className="cp-subnav-link-icon" icon={section.icon} />
                  }
                  {stripHTML(section.short || section.title)}
                </AnchorLink>
              </li>
            )}
          </ol> : ""}
        </nav>

        {/* prevent page jump */}
        <div className={`cp-subnav-dummy${fixed ? " is-visible" : " is-hidden"}`} style={{height}} key="d" />
      </Fragment>
    );
  }
}

export default hot(Subnav);
