/* react */
import React, {useMemo} from "react";
import {Badge, Center, Textarea} from "@mantine/core";

/* utils */
import varSwapRecursive from "../../utils/variables/varSwapRecursive";
import spoiler from "../../utils/blocks/spoiler";
import {getBlockContent} from "../../utils/blocks/getBlockContent";
import mortarEval from "../../utils/variables/mortarEval";
import {useBlock, useFormatters} from "../hooks/blocks/selectors";
import {useVariables} from "../hooks/blocks/useVariables";

/** type-specific render components */
import TypeRenderers from "./types/renderers";

/** type-specific methods for deriving data needed for rendering from current Block state */
import PreviewAdapters from "./types/previewAdapters";

/**
 * BlockPreview shows the varswapped version of the content currently being edited, it is used
 * both in BlockOutputPanel as a live preview, and on the main page as the blocks that make up the report.
 * A "debug" key is passed to all previews to indicate they are allowed to show stacktraces to the content creator
 */
function BlockPreview(props) {

  const {active, allowed, blockStateContent, debug, id, locale} = props;

  /** Input variables for block with given ID */
  const {variables} = useVariables(id);

  const block = useBlock(id);

  /**
   * The block content data to use for rendering.
   * If no "blockStateContent" prop is given, defaults to the redux store value of block.
   * Use the "blockStateContent" prop to provide override values if you want to show a
   * live preview of unsaved changes.
   */
  const blockContent = blockStateContent || getBlockContent(block, locale);

  /* redux */
  const formatterFunctions = useFormatters(locale);

  const {content, error, log} = useMemo(() => {
    let payload = {};
    // if a Block-specific preview adapter function exists, use that to build payload
    if (PreviewAdapters[block.type] && typeof PreviewAdapters[block.type] === "function") {

      /** @type {import("./types/PreviewAdapters").BlockPreviewAdapterParams} */
      const adapterParams = {active, block, blockContent, debug, locale, variables, formatterFunctions};
      payload = PreviewAdapters[block.type](adapterParams);
    }
    // if no such adapter exists, fallback to default where blockState logic is evaluated
    else {
      const {vars, error, log} = mortarEval("variables", variables, blockContent?.logic, formatterFunctions, locale);
      // if Block is active...
      payload.content = active
        // swap out variables with block's available input variables
        ? varSwapRecursive(vars, formatterFunctions, variables)
        // else, put spoiler marks on dynamic variables
        : spoiler(vars);
      payload.log = log ? log.join("\n") : "";
      payload.error = error;
    }
    return payload;
  }, [block, blockContent, active]);

  const Renderer = TypeRenderers[block.type];

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", top: -1, left: -1, opacity: 0.3, zIndex: 5, pointerEvents: "none"};
  const allowedOverlay = <div style={{...overlayStyle, backgroundColor: "pink"}}></div>;

  return (
    <div className="cms-block-preview" style={{width: "100%"}}>
      {!allowed && allowedOverlay}
      { Renderer
        ? <Renderer key="renderer" debug={debug} {...content} />
        : <Center style={{minHeight: 100}}><Badge key="type" color="gray" variant="outline">{block.type}</Badge></Center> }
      {debug && log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      {debug && error && <Textarea label="Error" minRows={3} value={error} />}
    </div>
  );

}

export default BlockPreview;
