import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {Helmet} from "react-helmet";
import "./Story.css";
import stripP from "../utils/formatters/stripP";
import stripHTML from "../utils/formatters/stripHTML";
import {timeFormat} from "d3-time-format";
import Section from "./sections/Section";
import Hero from "./sections/Hero";

import libs from "../utils/libs";

const formatTime = timeFormat("%B, %Y");

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
    const {storysections, date, slug} = this.props.story;
    const title = stripP(this.props.story.title);
    const titleRaw = stripHTML(this.props.story.title);

    const sections = storysections.map(d => {
      d.title = null;
      return d;
    });

    return (
      <div id="Story">
        <Helmet title={ titleRaw } />
        <div className="story-header">
          <div className="bg-image"  style={{backgroundImage: `url(/images/stories/${slug}.png)`}} />
          <div className="overlay"></div>
          <div className="text-wrapper">
            <h1 className="story-headline" dangerouslySetInnerHTML={{__html: title}} />
            <p className="story-subhead u-font-md u-uppercase u-margin-bottom-off">{formatTime(new Date(date))}</p>
          </div>
        </div>
        <div className="story-content">
          { sections.map(section => <Section key={section.slug} contents={section} />) }
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
