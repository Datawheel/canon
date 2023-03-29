import {Grid, SimpleGrid, Stack} from "@mantine/core";
import React, {useRef} from "react";
import {Viz} from "@datawheel/canon-next";

/**
 * CMS custom section
 */
export default function CustomSection({
  slug,
  heading,
  hideOptions,
  title,
  paragraphs,
  configOverride,
  loading,
  filters,
  resetButton,
  stats,
  sources,
  visualizations,
  vizHeadingLevel,
  updateSource,
  onSetVariables
}) {
  const section = useRef(null);

  return (
    <Grid
      className={`cp-section-inner cp-default-section-inner cp-${slug}-section-inner ${loading ? "is-loading" : ""}`}
      ref={section}
      my="md"
    >
      {/* sidebar */}
      <Grid.Col
        md={3}
        span={12}
        className="cp-section-content cp-default-section-caption"
      >
        <Stack spacing="sm">
          {heading}
          {filters}
          {stats}
          {paragraphs}
          {sources}
          {resetButton}
        </Stack>
      </Grid.Col>

      {/* caption */}
      {visualizations.length
        ? <Grid.Col
          md={9}
          span={12}
          className={`cp-default-section-figure${
            visualizations.length > 1 ? " cp-multicolumn-default-section-figure" : ""
          }${
            visualizations.filter(
              viz => viz.logic_simple && viz.logic_simple.type === "Graphic"
            ).length ? " cp-graphic-viz-grid" : ""
          }`}
        >
          <SimpleGrid
            breakpoints={[
              {minWidth: "sm", cols: 1},
              {minWidth: "md", cols: visualizations.length >= 2 ? 2 : 1}
            ]}
          >
            {visualizations.map(visualization =>
              <Viz
                section={section}
                config={visualization}
                headingLevel={vizHeadingLevel}
                sectionTitle={title}
                slug={slug}
                hideOptions={hideOptions}
                configOverride={configOverride}
                updateSource={updateSource}
                onSetVariables={onSetVariables}
                key={visualization.id}
              />
            )}
          </SimpleGrid>
        </Grid.Col>
        : ""}
    </Grid>
  );
}
