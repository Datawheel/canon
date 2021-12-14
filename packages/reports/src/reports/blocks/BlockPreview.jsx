/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Badge, Center} from "@mantine/core";

/* utils */
import varSwapRecursive from "../../utils/varSwapRecursive";
import spoiler from "../../utils/spoiler";

/* enums */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* type-specific render components */
import TypeRenderers from "./types/index.jsx";

/**
 * BlockPreview shows the varswapped version of the content currently being edited. It is instantiated in
 * Block.jsx and directly passed "blockState" from there, which represents the live-editing content.
 * Though instantiated in Block, it is not rendered until BlockOutput.
 */
function BlockPreview({blockState, active, variables, locale, allowed}) {

  /* redux */
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  // todo1.0 this will change from accessing the content to running the js (created by UI or custom) and varswapping the resulting object.
  // generators => vars
  // stats => content object
  // selector => object with options array and default etc
  // viz => d3 config
  let content = {};
  if (blockState.type === BLOCK_TYPES.GENERATOR) {
    content = {gen: "gen"};
  }
  else if (blockState.type === BLOCK_TYPES.SELECTOR) {
    content = {sel: "sel"};
  }
  else if (blockState.type === BLOCK_TYPES.VIZ) {
    content = {blockState, active, variables, locale, allowed};
  }
  else {
    content = active
      ? varSwapRecursive(blockState.contentByLocale[locale].content, formatterFunctions[locale], variables)
      : spoiler(blockState.contentByLocale[locale].content);
  }

  const Renderer = TypeRenderers[blockState.type];

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", top: -1, left: -1, opacity: 0.3, zIndex: 5, pointerEvents: "none"};
  const allowedOverlay = <div style={{...overlayStyle, backgroundColor: "pink"}}></div>;

  return (
    <div className="cms-block-preview">
      {!allowed && allowedOverlay}
      { Renderer
        ? <Renderer key="renderer" {...content} />
        : <Center><Badge key="type" color="gray" variant="outline">{blockState.type}</Badge></Center> }
    </div>
  );

}

export default BlockPreview;
