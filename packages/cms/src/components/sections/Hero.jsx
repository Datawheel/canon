import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {nest} from "d3-collection";

import stripHTML from "../../utils/formatters/stripHTML";

import Viz from "../Viz/Viz";
import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";

import Parse from "./components/Parse";

import "./Section.css";
import "./Hero.css";

/** the profile hero, AKA header, AKA splash */
class Hero extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      selectors: {},
      sources: []
    };
  }

  render() {
    const {contents, loading, sources, profile} = this.props;

    // no hero section; just grab the profile title & subtitle
    let title = profile.title;
    let subtitleContent = <Parse El="p" className="cp-hero-subtitle">{profile.subtitle}</Parse>;
    let paragraphs, sourceContent, statContent;


    // hero section; grab all the usual section goodness
    if (contents) {
      title = contents.title;

      if (contents.subtitles.length) {
        subtitleContent = contents.subtitles.map((subhead, i) =>
          <Parse className="cp-section-subhead display cp-hero-subhead" key={`${subhead.subtitle}-subhead-${i}`}>
            {subhead.subtitle}
          </Parse>
        );
      }

      // stats
      if (contents.stats.length > 0) {
        const statGroups = nest().key(d => d.title).entries(contents.stats);

        statContent = <div className="cp-stat-group-wrapper cp-hero-stat-group-wrapper">
          <div className="cp-stat-group cp-hero-stat-group">
            {statGroups.map(({key, values}) => <StatGroup className="cp-hero-stat" key={key} title={key} stats={values} />)}
          </div>
        </div>;
      }

      // descriptions
      if (contents.descriptions.length) {
        paragraphs = loading
          ? <p>Loading...</p>
          : contents.descriptions.map((content, i) =>
            <Parse className="cp-section-paragraph cp-hero-paragraph" key={`hero-paragraph-${i}`}>
              {content.description}
            </Parse>
          );
      }

      // sources
      sourceContent = <SourceGroup sources={sources} />;
    }


    // heading & subhead(s)
    const heading = <React.Fragment>
      <Parse El="h1" id={contents ? contents.slug : `${stripHTML(profile.title)}-hero`} className="cp-section-heading cp-hero-heading u-font-xxl">
        {title}
      </Parse>
      {subtitleContent}
    </React.Fragment>;


    return (
      <header className="cp-section cp-hero">
        <div className="cp-section-inner cp-hero-inner">
          {/* caption */}
          <div className="cp-section-content cp-hero-caption">
            {heading}
            {statContent}
            {paragraphs}
            {sourceContent}
          </div>

          {/* print the first visualization */}
          {contents && contents.visualizations && contents.visualizations.length
            ? <div className="cp-hero-figure">
              {contents.visualizations.map((visualization, ii) => ii === 0
                ? <Viz section={this} config={visualization} showTitle={false} options={false} title={title} slug={`${contents.slug}-${ii}`} key={ii} />
                : ""
              )}
            </div> : ""
          }
        </div>
      </header>
    );
  }
}

export default connect(state => ({
  locale: state.i18n.locale
}))(Hero);
