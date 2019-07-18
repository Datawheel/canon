import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Default.css";

export default class Default extends Component {
  render() {
    const {slug, title, heading, paragraphs, loading, filters, stats, sources, visualizations} = this.props;

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
        </div>

        {/* caption */}
        <div className={`cp-default-section-figure${visualizations.length > 1 ? " cp-multicolumn-default-section-figure" : ""}`}>
          {visualizations.map((visualization, ii) =>
            <Viz section={this} config={visualization} title={title} slug={`${slug}-${ii}`} key={ii} />
          )}
        </div>
      </div>
    );
  }
}
