import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import {AnchorLink} from "@datawheel/canon-core";

import {merge} from "d3-array";

import throttle from "../../../utils/throttle";
import blueprintIcons from "../../../utils/blueprintIcons";
import pxToInt from "../../../utils/formatters/pxToInt";
import stripHTML from "../../../utils/formatters/stripHTML";

import styles from "style.yml";

import "./Subnav.css";

class Subnav extends Component {

  constructor(props) {
    super(props);
    const sections = this.flattenSections(props.sections);
    this.state = {
      currSection: false,
      currSubSection: false,
      hasSubgroups: sections.some(s => s.children && s.children.some(c => c.children)),
      isOpen: false,
      top: false,
      fixed: false,
      sections
    };
    this.subnav = React.createRef();
    this.scrollBind = this.handleScroll.bind(this);
    this.toggleButton = React.createRef();
  }

  /** when tabbing out of the nav group, collapse it */
  onBlur(e) {
    const currentTarget = e.currentTarget;

    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        this.setState({isOpen: false});
      }
    }, 85); // register the click before closing
  }

  /** when clicking a subtitle, refocus the button to prevent the nav from losing focus and collapsing */
  onFocusButton() {
    setTimeout(() => {
      if (this.toggleButton.current) {
        this.toggleButton.current.focus();
      }
    }, 0);
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
      // the hierarchy is flat (i.e., <= 1 grouping)
      if (sections.length === 1) {
        flattenedSections = sections[0]
          .map(s => s[0])
          .filter(s => s.type.toLowerCase() !== "grouping"); // don't show groupings
      }
      // we got groupings
      else {
        flattenedSections = sections
          .map(s => {
            const subgroups = s.filter(d => d[0].type.toLowerCase() === "subgrouping");
            let children = merge(subgroups.length ? subgroups : s.slice(1));
            if (subgroups.length) {
              children = children.map(subgroup => {
                const obj = {...subgroup};
                obj.children = [];
                const currIndex = s.findIndex(d => d[0].id === obj.id);
                for (let i = currIndex + 1; i < s.length; i++) {
                  if (s[i][0].type.toLowerCase() === "subgrouping") break;
                  obj.children.push(s[i]);
                }
                obj.children = merge(obj.children);
                return obj;
              });
            }
            return {...s[0][0], children};
          })
          .filter(s => s.type.toLowerCase() === "grouping"); // only show groupings
      }
    }

    return flattenedSections;
  }

  /** crawl up the tree from the title and grab the section wrapper */
  getSectionWrapper(slug) {
    let elem = document.getElementById(slug);
    while (elem.className && !elem.className.includes("cp-section ") && elem.parentNode) elem = elem.parentNode;
    return elem;
  }

  /** on scroll, determine whether subnav is fixed, and which section we're in */
  handleScroll() {
    const {sections} = this.state;

    if (sections) {
      throttle(() => {
        const {currSection, fixed} = this.state;
        const topBorder = pxToInt(styles["nav-height"] || "50px") + pxToInt(styles["subnav-height"] || "50px");
        const screenTop = window.pageYOffset + topBorder;
        const heroHeight = document.querySelector(".cp-hero").getBoundingClientRect().height;

        // determine whether subnav is fixed
        if (screenTop > heroHeight && !fixed) {
          this.setState({fixed: true});
        }
        else if (screenTop < heroHeight && fixed) {
          this.setState({fixed: false});
        }

        // deteremine which section we're in
        let newSection = false, newSubSection = false;
        sections.forEach(section => {
          const elem = this.getSectionWrapper(section.slug);
          const top = elem ? elem.getBoundingClientRect().top : 1;
          if (top <= topBorder) {
            newSection = section;
          }
        });

        if (newSection && newSection.children) {
          newSection.children.forEach(section => {
            const elem = this.getSectionWrapper(section.slug);
            const top = elem ? elem.getBoundingClientRect().top : 1;
            if (top <= topBorder) {
              newSubSection = section;
            }
          });
        }

        // update state only when changes detected
        if (currSection !== newSection) {
          this.setState({currSection: newSection, currSubSection: newSubSection});
        }
      }, 30);
    }
  }

  renderPopup(section) {
    const {isOpen} = this.state;
    return <ul className={`cp-subnav-group-list ${isOpen ? "is-open" : "is-closed"}`}>
      { section.children.map(child =>
        <li key={child.id} className="cp-subnav-group-item">
          <AnchorLink
            className="cp-subnav-group-link u-font-xs"
            to={child.slug}
          >
            <Icon className="cp-subnav-group-link-icon" icon={child.icon && blueprintIcons.find(i => i === child.icon) ? child.icon : "dot"} />
            {child.short && stripHTML(child.short) ? stripHTML(child.short) : stripHTML(child.title)}
          </AnchorLink>
        </li>
      ) }
    </ul>;
  }

  render() {
    if (this.context.print) return null;
    const {children} = this.props;
    const {currSection, currSubSection, fixed, hasSubgroups, isOpen, sections} = this.state;

    if (!sections || !Array.isArray(sections) || sections.length < 2) return null;

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
              <li className={`cp-subnav-item ${isOpen || currSection.slug === section.slug ? "is-active" : "is-inactive"}`} key={section.slug}
                // onBlur={e => this.onBlur(e)}
                // onClick={() => this.onFocusButton()}
              >
                <AnchorLink
                  // onClick={() => this.setState({isOpen: !isOpen})}
                  // onFocus={() => this.setState({isOpen: true})}
                  ref={this.toggleButton}
                  className={`cp-subnav-link ${sections.length >= 5 ? "u-font-xs" : "u-font-sm" }`}
                  to={section.slug}
                >
                  {section.icon && blueprintIcons.find(i => i === section.icon) &&
                    <Icon className="cp-subnav-link-icon" icon={section.icon} />
                  }
                  {section.short && stripHTML(section.short) ? stripHTML(section.short) : stripHTML(section.title)}
                </AnchorLink>
                { section.children && section.children.length && !hasSubgroups
                  ? this.renderPopup.bind(this)(section)
                  : null }
              </li>
            )}
          </ol> : null}

          {hasSubgroups && currSection ? <ol className="cp-subnav-list cp-subnav-secondary" key="s">
            {(currSection ? currSection.children : []).map(section =>
              <li className="cp-subnav-item" key={section.slug}
                // onBlur={e => this.onBlur(e)}
                // onClick={() => this.onFocusButton()}
              >
                <AnchorLink
                  // onClick={() => this.setState({isOpen: !isOpen})}
                  // onFocus={() => this.setState({isOpen: true})}
                  ref={this.toggleButton}
                  className={`cp-subnav-link ${isOpen || currSubSection.slug === section.slug ? "is-active" : "is-inactive"} ${sections.length >= 5 ? "u-font-xs" : "u-font-sm" }`}
                  to={section.slug}
                >
                  {section.icon && blueprintIcons.find(i => i === section.icon) &&
                    <Icon className="cp-subnav-link-icon" icon={section.icon} />
                  }
                  {section.short && stripHTML(section.short) ? stripHTML(section.short) : stripHTML(section.title)}
                </AnchorLink>
                { section.children && section.children.length
                  ? this.renderPopup.bind(this)(section)
                  : null }
              </li>
            )}
          </ol> : null}
        </nav>

        {/* prevent page jump */}
        <div className={`cp-subnav-dummy${fixed ? " is-visible" : " is-hidden"}`} style={{height}} key="d" />
      </Fragment>
    );
  }
}

Subnav.contextTypes = {
  print: PropTypes.bool
};

export default hot(Subnav);
