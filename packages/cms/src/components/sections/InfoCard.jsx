import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Section.css";
import "./InfoCard.css";

export default class InfoCard extends Component {

  render() {
    const {slug, title, heading, mainTitle, subTitle, paragraphs, loading, filters, stats, secondaryStats, sources, visualizations, vizHeadingLevel} = this.props;

    return (
      <div
        className={`cp-section-inner cp-${slug}-section-inner cp-info-card-section-inner${loading ? " is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* header */}
        <header className="cp-info-card-section-header">
          <div className="cp-info-card-header">
            <div className="cp-info-card-title">{mainTitle}</div>
            <div className="cp-info-card-filters">{filters}</div>
          </div>
          {stats}
        </header>

        {/* main content */}
        <div className="cp-info-card-section-main">
          <div className="cp-section-content cp-info-card-section-content">
            <div className="cp-info-card-paragraphs">
              {paragraphs}
            </div>
            <div className="cp-info-card-secondary-stats">
              <p className="cp-section-subhead display cp-info-card-section-subhead">Key Data Points</p>
              {secondaryStats}
            </div>
          </div>

          {visualizations && visualizations.length
            ? <div className="cp-section-content cp-info-card-section-viz">
              {visualizations.map((visualization, ii) => ii === 0
                ? <Viz section={this} config={visualization} options={false} slug={slug} headingLevel={vizHeadingLevel} sectionTitle={title} key={`${slug}-${ii}`} /> : ""
              )}
            </div> : ""
          }
          {sources}
        </div>
        <div className="cp-info-card-subtitle">{subTitle}</div>
      </div>
    );
  }
}
