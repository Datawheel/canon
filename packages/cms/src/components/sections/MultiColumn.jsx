import React, {Component} from "react";
import Viz from "../Viz/Viz";
import "./MultiColumn.css";

export default class MultiColumn extends Component {
  render() {
    const {configOverride, slug, title, heading, hideOptions, paragraphs, loading, filters, resetButton, stats, sources, visualizations, vizHeadingLevel} = this.props;

    return (
      <div
        className={`cp-section-inner cp-multi-column-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
        ref={comp => this.section = comp}
      >
        {/* heading */}
        {heading}

        {/* tube of content */}
        <div className="cp-section-content cp-multi-column-section-caption">
          {filters}
          {stats}
          {paragraphs}
          {sources}
          {resetButton}
          {visualizations.map((visualization, ii) =>
            <Viz
              section={this}
              config={visualization}
              configOverride={configOverride}
              slug={slug}
              headingLevel={vizHeadingLevel}
              sectionTitle={title}
              hideOptions={hideOptions}
              key={`${slug}-${ii}`}
            />
          )}
        </div>
      </div>
    );
  }
}
