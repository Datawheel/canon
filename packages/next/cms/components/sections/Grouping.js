import React, {useContext, useRef} from "react";
import {Box, Stack} from "@mantine/core";
// eslint-disable-next-line import/no-cycle
import {Viz} from "../../..";
import ProfileContext from "../ProfileContext";

/**
 *
 * @param {*} param0
 * @returns
 */
export default function Grouping({
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
  visualizations,
  vizHeadingLevel,
  updateSource,
  onSetVariables,
}) {
  const section = useRef(null);
  const {profileId} = useContext(ProfileContext);
  return (
    <Box
      className={`
        cp-section-inner
        cp-grouping-section-inner
        cp-${slug}-section-inner
        ${loading ? "is-loading" : ""}`}
      ref={section}
    >
      {/* sidebar */}
      <Stack className="cp-section-content cp-grouping-section-caption">
        {heading}
        {filters}
        {stats}
        {paragraphs}
        {sources}
        {resetButton}
      </Stack>

      {/* caption */}
      <Box className={`cp-grouping-section-figure${
        visualizations.length > 1 ? " cp-multicolumn-grouping-section-figure" : ""
      }${
        visualizations.filter(
          (viz) => viz.logic_simple && viz.logic_simple.type === "Graphic",
        ).length
          ? " cp-graphic-viz-grid"
          : ""
      }`}
      >
        {visualizations.map((visualization) => (
          <Viz
            section={section}
            config={visualization}
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
