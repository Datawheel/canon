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
function BlockPreview(props) {

  const {blockState, active, variables, locale, allowed} = props;

  /* redux */
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  let content = {};
  if ([BLOCK_TYPES.GENERATOR, BLOCK_TYPES.SELECTOR, BLOCK_TYPES.VIZ].includes(blockState.type)) {
    content = props;
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
