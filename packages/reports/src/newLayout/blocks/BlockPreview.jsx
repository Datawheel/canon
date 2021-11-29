/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Badge, Center} from "@mantine/core";

/* utils */
import varSwapRecursive from "../../utils/varSwapRecursive";

/* type-specific render components */
import TypeRenderers from "./types/index.jsx";

/**
 * BlockPreview shows the varswapped version of the content currently being edited. It is instantiated in
 * Block.jsx and directly passed "blockState" from there, which represents the live-editing content.
 * Though instantiated in Block, it is not rendered until BlockOutput.
 */
function BlockPreview({blockState, active, variables, locale}) {

  /* redux */
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  const spoiler = obj => Object.keys(obj).reduce((acc, d) => ({...acc, [d]: typeof obj[d] === "string" ? obj[d].replace(/[A-z0-9]*\{\{[^\}]+\}\}/g, "<span style=\"background-color:lightgrey; color:lightgrey;\">spoiler</span>") : obj[d]}), {});

  const content = active
    ? varSwapRecursive(blockState.contentByLocale[locale].content, formatterFunctions[locale], variables)
    : spoiler(blockState.contentByLocale[locale].content);

  const Renderer = TypeRenderers[blockState.type];

  return (
    <div className="cms-block-preview">
      { Renderer
        ? <Renderer {...content} />
        : <Center><Badge color="gray" variant="outline">{blockState.type}</Badge></Center> }
    </div>
  );

}

export default BlockPreview;
