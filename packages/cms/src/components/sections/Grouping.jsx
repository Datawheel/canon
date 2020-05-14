import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Grouping.css";

export default class Grouping extends Component {
  render() {
    const {slug, title, heading, hideOptions, paragraphs, loading, filters, resetButton, stats, sources, visualizations, vizHeadingLevel} = this.props;

    return (
      <div
        className={`cp-section-inner cp-grouping-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* sidebar */}
        <div className="cp-section-content cp-grouping-section-caption">
          {heading}
          {filters}
          {stats}
          {paragraphs}
          {sources}
          {resetButton}
        </div>

        {/* caption */}
        <div className={`cp-grouping-section-figure${
          visualizations.length > 1 ? " cp-multicolumn-grouping-section-figure" : ""
        }${
          visualizations.filter(viz => viz.logic_simple && viz.logic_simple.type === "Graphic").length ? " cp-graphic-viz-grid" : ""
        }`}>
          {visualizations.map((visualization, ii) =>
            <Viz
              section={this}
              config={visualization}
              slug={slug}
              headingLevel={vizHeadingLevel}
              sectionTitle={title}
              hideOptions={hideOptions}
              key={ii}
            />
          )}
        </div>
      </div>
    );
  }
}
