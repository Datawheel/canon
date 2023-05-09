import {Stack} from "@mantine/core";
import React, {useRef} from "react";
import Viz from "../Viz/Viz";

export default function SingleColumn(props) {
  const {
    configOverride, slug, title, heading, hideOptions, paragraphs, loading, filters, resetButton, stats, sources, visualizations, vizHeadingLevel, updateSource, onSetVariables
  } = props;
  const section = useRef(null);
  return (
    <Stack
      className={`cp-section-inner cp-single-column-section-inner cp-${slug}-section-inner${
        loading
          ? " is-loading"
          : ""}`}
      ref={section}
    >
      {/* heading */}
      {heading}

      {/* tube of content */}
      <Stack className="cp-section-content cp-single-column-section-caption">
        {filters}
        {stats}
        {paragraphs}
        {sources}
        {resetButton}
        {visualizations.map((visualization, ii) => 
          <Viz
            section={section}
            config={visualization}
            slug={slug}
            headingLevel={vizHeadingLevel}
            sectionTitle={title}
            hideOptions={hideOptions}
            configOverride={configOverride}
            key={`${slug}-${ii}`}
            updateSource={updateSource}
            onSetVariables={onSetVariables}
          />
        )}
      </Stack>
    </Stack>
  );
}
