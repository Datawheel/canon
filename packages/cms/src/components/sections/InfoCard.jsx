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
        <div className="cp-info-card-section-header">
          <div className="cp-info-card-section-header-caption">
            {heading}
          </div>
          {stats}
        </div>

        <div className="cp-info-card-section-main">
          {/* main content */}
          <div className="cp-section-content cp-info-card-section-caption">
            {secondaryStats}
            {filters}
            {paragraphs}
            {sources}
          </div>

          {visualizations && visualizations.length
            ? <div className="cp-section-content cp-info-card-section-viz">
              {visualizations.map((visualization, ii) => ii === 0
                ? <Viz section={this} config={visualization} options={false} slug={slug} headingLevel={vizHeadingLevel} key={`${slug}-${ii}`} /> : ""
              )}
            </div> : ""
          }
        </div>
      </div>
    );
  }
}
