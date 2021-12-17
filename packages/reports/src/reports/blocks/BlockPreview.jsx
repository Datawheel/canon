/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Badge, Center} from "@mantine/core";

/* utils */
import varSwapRecursive from "../../utils/variables/varSwapRecursive";
import spoiler from "../../utils/blocks/spoiler";
import mortarEval from "../../utils/variables/mortarEval";

/* enums */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* type-specific render components */
import TypeRenderers from "./types/index.jsx";


/**
 * BlockPreview shows the varswapped version of the content currently being edited, it is used
 * both in BlockOutputPanel as a live preview, and on the main page as the blocks that make up the report.
 * A "debug" key is passed to all previews to indicate they are allowed to show stacktraces to the content creator
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
    // todo1.0 fix formatter funtions
    const {vars, log} = mortarEval("variables", variables, blockState.contentByLocale[locale].content.logic, formatterFunctions[locale], locale);
    content = active
      ? varSwapRecursive(vars, formatterFunctions[locale], variables)
      : spoiler(vars);
  }

  const Renderer = TypeRenderers[blockState.type];

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", top: -1, left: -1, opacity: 0.3, zIndex: 5, pointerEvents: "none"};
  const allowedOverlay = <div style={{...overlayStyle, backgroundColor: "pink"}}></div>;

  return (
    <div className="cms-block-preview">
      {!allowed && allowedOverlay}
      { Renderer
        ? <Renderer key="renderer" debug={true} {...content} />
        : <Center><Badge key="type" color="gray" variant="outline">{blockState.type}</Badge></Center> }
    </div>
  );

}

export default BlockPreview;
