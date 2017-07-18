import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "./AnchorLink";

import "./SubNav.css";

class SubNav extends Component {

  constructor() {
    super();
    this.state = {
      activeSection: false,
      activeTopic: false,
      top: false,
      visible: false
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
    this.setState({top: this.container.getBoundingClientRect().top + window.scrollY});
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  handleScroll() {

    const {topics} = this.context;
    const {activeSection, activeTopic, visible} = this.state;
    const {visible: visibleProp} = this.props;
    let newVisible = visibleProp;
    if (typeof newVisible === "function") newVisible = newVisible.bind(this)();

    let newActiveSection = false, newActiveTopic = false;
    topics.forEach(topic => {
      const elem = document.getElementById(topic.slug);
      const top = elem ? elem.getBoundingClientRect().top : 1;
      if (top <= 0) newActiveTopic = topic;
    });

    if (newActiveTopic) {
      (newActiveTopic.sections || []).forEach(section => {
        const elem = document.getElementById(section.name);
        const top = elem ? elem.getBoundingClientRect().top : 1;
        if (top <= 0) newActiveSection = section.name;
      });
      newActiveTopic = newActiveTopic.slug;
    }

    if (visible !== newVisible || activeTopic !== newActiveTopic || activeSection !== newActiveSection) {
      this.setState({
        visible: newVisible,
        activeSection: newActiveSection,
        activeTopic: newActiveTopic
      });
    }

  }

  render() {

    const {topics} = this.context;
    const {anchor, children, sections, type} = this.props;
    const {activeSection, activeTopic, visible} = this.state;

    return (
      <div ref={ comp => this.container = comp } className={ `subnav ${ anchor } ${ type } ${ visible ? "visible" : "hidden" }` }>
        { children }
        { topics.length
        ? <ul>
            { topics.map(topic => <li className={ `topic ${ activeTopic === topic.slug ? "active" : "" }` }><AnchorLink to={ topic.slug }>{ topic.title }</AnchorLink>
              { sections && topic.sections.length
              ? <ul>{ topic.sections.map(section => <li className={ `section ${ activeSection === section.name ? "active" : "" }` }><AnchorLink to={ section.name }>{ section.title || section.name }</AnchorLink></li>) }</ul>
              : null }
            </li>) }
          </ul>
        : null}
      </div>
    );
  }
}

SubNav.contextTypes = {
  topics: PropTypes.array
};

SubNav.defaultProps = {
  anchor: "top",
  sections: true,
  type: "scroll",
  visible() {
    if (!window) return false;
    if (this.props.type === "sticky") return this.state.top <= window.scrollY;
    const {topics} = this.context;
    if (topics.length) {
      const elem = document.getElementById(topics[0].slug);
      if (elem) return elem.getBoundingClientRect().top <= 0;
    }
    return window.innerHeight < window.scrollY;
  }
};

export {SubNav};
