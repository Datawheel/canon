import {Box} from "@mantine/core";
import React, {useContext, useRef} from "react";
import Viz from "../Viz/Viz";
import ProfileContext from "../ProfileContext";

/** */
export default function MultiColumn(
  {
    configOverride,
    slug,
    title,
    heading,
    hideOptions,
    paragraphs,
    loading,
    filters,
    resetButton,
    stats,
    sources,
    visualizations = [],
    vizHeadingLevel,
    updateSource,
    onSetVariables,
  },
) {
  const section = useRef(null);
  const {profileId} = useContext(ProfileContext);
  return (
    <Box
      className={`cp-section-inner cp-multi-column-section-inner cp-${
        slug
      }-section-inner ${loading ? "is-loading" : ""}`}
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
          columnFill: "balance",
        }}
      >
        {filters}
        {stats}
        {paragraphs}
        {sources}
        {resetButton}
        {visualizations.map((visualization) => (
          <Viz
            section={section}
            config={visualization}
            configOverride={configOverride}
            slug={slug}
            headingLevel={vizHeadingLevel}
            sectionTitle={title}
            hideOptions={hideOptions}
            key={`${profileId}-${visualization.id}`}
            updateSource={updateSource}
            onSetVariables={onSetVariables}
          />
        ))}
      </Box>
    </Box>
  );
}
