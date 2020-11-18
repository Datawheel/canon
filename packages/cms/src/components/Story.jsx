import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {Helmet} from "react-helmet-async";
import "./Story.css";
import stripP from "../utils/formatters/stripP";
import stripHTML from "../utils/formatters/stripHTML";
import Section from "./sections/Section";
import Hero from "./sections/Hero";
import Mirror from "./Viz/Mirror";

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

    if (!story) return null;
    if (story.error) return <div>{story.error}</div>;

    const {storysections} = story;
    const titleRaw = stripHTML(this.props.story.title);

    return (
      <Fragment>
        <div className="cp-story">
          <Helmet title={titleRaw} />
          <Hero profile={story} />
          <main className="cp-story-main" id="main">
            {storysections.map(section =>
              <Section key={section.slug} contents={section} />
            )}
          </main>
        </div>

        <Mirror /> {/* for rendering visualization/section to save as image */}
      </Fragment>
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
