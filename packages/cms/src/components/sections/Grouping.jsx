import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Grouping.css";

export default class Grouping extends Component {
  render() {
    const {slug, title, heading, paragraphs, loading, filters, stats, sources, visualizations, vizHeadingLevel} = this.props;

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
        </div>

        {/* caption */}
        <div className={`cp-grouping-section-figure${visualizations.length > 1 ? " cp-multicolumn-grouping-section-figure" : ""}`}>
          {visualizations.map((visualization, ii) =>
            <Viz section={this} config={visualization} title={title} slug={`${slug}-${ii}`} headingLevel={vizHeadingLevel} key={ii} />
          )}
        </div>
      </div>
    );
  }
}
