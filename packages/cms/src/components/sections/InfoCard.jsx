import React, {Component} from "react";
// import {AnchorLink} from "@datawheel/canon-core";
import {nest} from "d3-collection";
import stripP from "../../utils/formatters/stripP";

import StatGroup from "../Viz/StatGroup";
import Viz from "../Viz/Viz";
import Selector from "./components/Selector";
import "./Section.css";

import "./InfoCard.css";

export default class InfoCard extends Component {

  render() {
    const {slug, title, heading, paragraphs, loading, filters, stats, secondaryStats, sources, visualizations, vizHeadingLevel} = this.props;

    return (
      <div
        className={`cp-section-inner cp-${slug}-section-inner cp-info-card-section-inner${loading ? " is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* header */}
        <header className="cp-info-card-section-header">
          <div className="cp-info-card-header">
            <div className="cp-info-card-title"><span>&#9702;</span> {heading}</div>
            <div className="cp-info-card-filters">{filters}</div>
          </div>
          {stats}
        </header>

        {/* main content */}
        <div className="cp-info-card-section-main">
          <div className="cp-section-content cp-info-card-section-content">
            <div className="cp-info-card-paragraphs">{paragraphs}</div>
            <div className="cp-info-card-secondary-stats">
              <strong>Key Data Points</strong>
              {secondaryStats}
            </div>
          </div>

          {visualizations && visualizations.length
            ? <div className="cp-section-content cp-info-card-section-viz">
              {visualizations.map((visualization, ii) => ii === 0
                ? <Viz section={this} config={visualization} options={false} slug={`${slug}-${ii}`} headingLevel={vizHeadingLevel} key={`${slug}-${ii}`} /> : ""
              )}
            </div> : ""
          }
        </div>
        <div className="cp-info-card-section-sources">{sources}</div>
      </div>
    );
  }
}
