import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Default.css";

export default class Default extends Component {
  render() {
    const {slug, heading, title, paragraphs, loading, filters, resetButton, stats, sources, visualizations, vizHeadingLevel} = this.props;

    return (
      <div
        className={`cp-section-inner cp-default-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* sidebar */}
        <div className="cp-section-content cp-default-section-caption">
          {heading}
          {filters}
          {stats}
          {paragraphs}
          {sources}
          {resetButton}
        </div>

        {/* caption */}
        <div className={`cp-default-section-figure${
          visualizations.length > 1 ? " cp-multicolumn-default-section-figure" : ""
        }${
          visualizations.filter(viz => viz.logic_simple && viz.logic_simple.type === "Graphic").length ? " cp-graphic-viz-grid" : ""
        }`}>
          {visualizations.map((visualization, ii) =>
            <Viz section={this} config={visualization} headingLevel={vizHeadingLevel} sectionTitle={title} slug={slug} key={ii} />
          )}
        </div>
      </div>
    );
  }
}
