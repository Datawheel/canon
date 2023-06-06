import {Box} from "@mantine/core";
import React, {useRef} from "react";
import Viz from "../Viz/Viz";

/** */
export default function MultiColumn(
  {
    configOverride, slug, title, heading, hideOptions, paragraphs, loading, filters, resetButton, stats, sources, visualizations = [], vizHeadingLevel, updateSource, onSetVariables
  }
) {
  const section = useRef(null);
  return (
    <Box
      className={`cp-section-inner cp-multi-column-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
      ref={section}
    >
      {/* heading */}
      {heading}

      {/* tube of content */}
      <Box
        className="cp-section-content cp-multi-column-section-caption"
        sx={{
          columnWidth: "20rem",
          columnCount: 3,
          columnFill: "balance"
        }}
      >
        {filters}
        {stats}
        {paragraphs}
        {sources}
        {resetButton}
        {visualizations.map((visualization, ii) =>
          <Viz
            section={section}
            config={visualization}
            configOverride={configOverride}
            slug={slug}
            headingLevel={vizHeadingLevel}
            sectionTitle={title}
            hideOptions={hideOptions}
            key={`${slug}-${ii}`}
            updateSource={updateSource}
            onSetVariables={onSetVariables}
          />
        )}
      </Box>
    </Box>
  );
}
