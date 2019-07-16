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
    const {slug, title, heading, paragraphs, loading, filters, stats, secondaryStats, sources, visualizations} = this.props;

    return (
      <div
        className={`cp-section-inner cp-${slug}-section-inner cp-info-card-section-inner bp3-card bp3-elevation-0${loading ? " is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* header */}
        <div className="cp-section-info-card-header">
          {heading}
          {stats}
        </div>

        <div className="cp-section-content">
          {/* main content */}
          <div className="cp-section-content cp-info-card-section-caption">
            {secondaryStats}
            {filters}
            {paragraphs}
            {sources}
          </div>

          {visualizations && visualizations.length
            ? <div className="cp-section-content cp-info-card-section-caption">
              {visualizations.map((visualization, ii) => ii === 0
                ? <Viz section={this} config={visualization} title={title} slug={`${slug}-${ii}`}  key={`${slug}-${ii}`} /> : ""
              )}
            </div> : ""
          }
        </div>
      </div>
    );
  }
}
