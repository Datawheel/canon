/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Badge, Center, Textarea, Text} from "@mantine/core";

/* utils */
import varSwapRecursive from "../../utils/variables/varSwapRecursive";
import spoiler from "../../utils/blocks/spoiler";
import {getBlockContent} from "../../utils/blocks/getBlockContent";
import mortarEval from "../../utils/variables/mortarEval";
import {useBlock} from "../hooks/blocks/selectors";
import {useVariables} from "../hooks/blocks/useVariables";

/** type-specific render components */
import TypeRenderers from "./types/renderers";

/** type-specific methods for deriving data needed for rendering from current Block state */
import PreviewAdapters from "./types/PreviewAdapters";


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
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  /**
   * todo1.0 this is a pretty gnarly statement, which needs to be thought about. Block types have some things in common:
   * 1) they subscribe to other blocks which gives them variables
   * 2) they can have API(s) which gives them a resp
   * 3) they return some javascript, which MAY then be used visually (but not necessarily)
   * 4) they export a set of variables for others to consume
   *
   * The problem is, each block acts a little bit differently:
   * - GENERATORS run serverside, and they return variables DIRECTLY, no rendering needed, just variables to pass to consumers
   * - SELECTORS run serverside, which returns their *config*. This config is then combined with the state of query args,
   *   to determine which variables this should export, which represents the *current id and label of the selector state*
   *   Further complicating things, selectors are also run client-side, so that the dropdown can be rendered by getting its
   *   list of options, default, name, etc.
   * - VIZES run clientside, and return a d3plus config
   * - STATLIKES run serverside so their variables can be calculated (stat1title, stat2value, etc) but are also run locally
   *   so that keystroke updates can show immediately in the preview. But it's important to note that the config returns
   *   {title, subtitle} but then the block actually exports {stat1title, stat1value}
   *
   * FURTHER. Any of these can have an API call that feeds them. In the case of statlikes, we don't want to be hitting that API
   * over and over for each keystroke. So we hybridly run a local eval using the resp *from the SSR run*.
   *
   * This prompts a discussion on what a block exactly is - because some of them return real vars, some return materialized vars,
   * and some return configs.
   *
   * think with dave and ryan on this
   */

  const {content, error, log} = useMemo(() => {
    let payload = {};
    // if a Block-specific preview adapter function exists, use that to build payload
    if (PreviewAdapters[block.type] && typeof PreviewAdapters[block.type] === "function") {

      /** @type {import("./types/PreviewAdapters").BlockPreviewAdapterParams} */
      const adapterParams = {active, block, blockContent, debug, locale, variables};
      payload = PreviewAdapters[block.type](adapterParams);
    }
    // if no such adapter exists, fallback to default where blockState logic is evaluated
    else {
      const {vars, error, log} = mortarEval("variables", variables, blockContent?.logic, formatterFunctions[locale], locale);
      // if Block is active...
      payload.content = active
        // swap out variables with block's available input variables
        ? varSwapRecursive(vars, formatterFunctions[locale], variables)
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
