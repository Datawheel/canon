/* react */
import React from "react";
import {useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";

/** type-specific render components */
import TypeRenderers from "../reports/blocks/types/renderers";
import {BLOCK_TYPES} from "../utils/consts/cms";

/** default siteSettings */
import siteSettings from "../utils/settings/site";
import blockSettings from "../utils/settings/block";

import {group} from "d3-array";

import {BLOCK_TYPES} from "../utils/consts/cms";

/**
 *
 */
function Section({content}) {

  const columnGroups = group(content.blocks, d => d.blockcol);
  const columnArray = Array.from(columnGroups, g => g[1].sort((a, b) => a.blockRow - b.blockRow));

  const theme = useMantineTheme();
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  return (
    <div className="cms-section" style={{
      alignItems: "stretch",
      backgroundColor: siteSettings.section.backgroundColor,
      borderRadius: siteSettings.section.borderRadius,
      boxShadow: siteSettings.section.boxShadow,
      display: "flex",
      flexDirection: smallScreen ? "column" : "row",
      flexWrap: "nowrap",
      margin: siteSettings.section.margin,
      padding: siteSettings.section.padding,
      width: `calc(100% - ${siteSettings.section.margin * 2}px)`
    }}>
      { columnArray
        .map((blocks, i) => {

          const staticWidths = blocks
            .map(({settings}) => parseFloat(settings.width))
            .filter(d => !isNaN(d));

          return <div className="cms-column" key={i}
            style={{
              display: "flex",
              flex: "1 1 100%",
              flexWrap: "wrap",
              height: "100%",
              maxWidth: smallScreen ? "100%" : staticWidths.length ? Math.max(...staticWidths) : "none",
              padding: siteSettings.column.padding
            }}>
            { blocks
              .sort((a, b) => a.blockrow - b.blockrow)
              .map(block => {
                const {id, renderContent, settings, type} = block;
                const Renderer = TypeRenderers[type];
                // todo1.0 fix this as part of ryan's rewrite
                const payload = type === BLOCK_TYPES.SELECTOR ? {config: renderContent} : renderContent;
                return <div key={block.id} style={{
                  flex: type === BLOCK_TYPES.VIZ ? "1 1 100%"
                    : settings.display === "inline" ? "1 1 auto" : "0 0 100%",
                  minHeight: type === BLOCK_TYPES.VIZ && smallScreen ? 300 : "none",
                  padding: siteSettings.block.padding,
                  textAlign: settings.align || blockSettings.align.defaultValue
                }}>
                  <Renderer key={id} {...payload} />
                </div>;
              })}
          </div>;
        }) }
    </div>
  );

}

export default Section;
