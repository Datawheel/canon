import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {Helmet} from "react-helmet";
import "./Story.css";
import stripP from "../utils/formatters/stripP";
import stripHTML from "../utils/formatters/stripHTML";
import Section from "./sections/Section";
import Hero from "./sections/Hero";

import libs from "../utils/libs";

class Story extends Component {

  getChildContext() {
    const {formatters, router} = this.props;
    return {
      formatters: formatters.reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {}),
      router
    };
  }

  render() {

    const {story} = this.props;
    const {storysections} = story;
    const titleRaw = stripHTML(this.props.story.title);

    return (
      <div id="Story">
        <Helmet title={ titleRaw } />
        <Hero profile={story} />
        <div className="story-content">
          { storysections.map(section => <Section key={section.slug} contents={section} />) }
        </div>
      </div>
    );
  }

}

Story.childContextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object
};

Story.need = [
  fetchData("story", "/api/story/<slug>/"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  story: state.data.story
}))(Story);
