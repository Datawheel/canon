import React, {Component} from "react";
// import Viz from "../../../src/components/Viz/Viz";

export default class CustomSection2 extends Component {
  render() {
    const {slug, contents, heading, hideOptions, title, paragraphs, loading, filters, resetButton, stats, sources, visualizations, vizHeadingLevel} = this.props;
    console.log(contents);

    return (
      <div
        className={`cp-section-inner cp-default-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        <h1>{`LOOK AT ME IM ${contents.title} AND IM 2`}</h1>
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
        {visualizations.length
          ? <div className={`cp-default-section-figure${
            visualizations.length > 1 ? " cp-multicolumn-default-section-figure" : ""
          }${
            visualizations.filter(viz => viz.logic_simple && viz.logic_simple.type === "Graphic").length ? " cp-graphic-viz-grid" : ""
          }`}>
            {visualizations.map((visualization, ii) =>
              <div
                section={this}
                config={visualization}
                headingLevel={vizHeadingLevel}
                sectionTitle={title}
                slug={slug}
                hideOptions={hideOptions}
                key={ii}
              />
            )}
          </div> : ""
        }
      </div>
    );
  }
}
