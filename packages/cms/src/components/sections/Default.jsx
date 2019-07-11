import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./Default.css";

export default class Default extends Component {
  render() {
    const {slug, title, heading, paragraphs, loading, filters, stats, sources, visualizations} = this.props;

    const miniviz = visualizations.length > 1 ? visualizations[0] : false;
    const mainviz = visualizations.length > 1 ? visualizations.slice(1) : visualizations;

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

          {miniviz &&
            <Viz className="cp-default-section-miniviz" section={this} config={miniviz} title={ title } slug={`${slug}_miniviz`} />
          }
        </div>

        {/* caption */}
        {mainviz.map((visualization, i) =>
          <div className="cp-default-section-figure" key={i}>
            <Viz section={this} config={visualization} title={title} slug={`${slug}-${i}`} />
          </div>
        )}
      </div>
    );
  }
}
