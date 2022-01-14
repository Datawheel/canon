/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Badge, Center, Textarea, Text} from "@mantine/core";
import {format} from "pretty-format";

/* utils */
import varSwapRecursive from "../../utils/variables/varSwapRecursive";
import spoiler from "../../utils/blocks/spoiler";
import mortarEval from "../../utils/variables/mortarEval";
import runSelector from "../../utils/selectors/runSelector";


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

  const {block, blockStateContent, blockType, active, variables, locale, allowed, debug} = props;

  /* redux */
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  const LENGTH_CUTOFF_CHAR = 10000;

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

  const {content, error, log, duration} = useMemo(() => {
    const payload = {};
    if (block.type === BLOCK_TYPES.GENERATOR) {
      if (!active) return {content: {}, log: "", error: false, duration: false};
      payload.content = {outputVariables: format(block._variables)};
      payload.log = block._status && block._status.log ? block._status.log.map(d => format(d)).join("\n") : false;
      payload.error = block._status && block._status.error ? block._status.error : block._variables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${block._variables.length} chars)` : false;
      payload.duration = block._status && block._status.duration ? block._status.duration : false;
    }
    else if (block.type === BLOCK_TYPES.SELECTOR) {
      const {config, log, error} = runSelector(block.contentByLocale[locale].content.logic, variables, locale);
      payload.content = {id: block.id, config};
      payload.log = log ? log.join("\n") : "";
      payload.error = error;
    }
    else if (block.type === BLOCK_TYPES.VIZ) {
      payload.content = props;
    }
    else { // stat-like
      const {vars, error, log} = mortarEval("variables", variables, blockStateContent?.logic, formatterFunctions[locale], locale);
      payload.content = active
        ? varSwapRecursive(vars, formatterFunctions[locale], variables)
        : spoiler(vars);
      payload.log = log ? log.join("\n") : "";
      payload.error = error;
    }
    return payload;
  }, [block, blockStateContent, active]);

  const Renderer = TypeRenderers[blockType];

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", top: -1, left: -1, opacity: 0.3, zIndex: 5, pointerEvents: "none"};
  const allowedOverlay = <div style={{...overlayStyle, backgroundColor: "pink"}}></div>;

  return (
    <div className="cms-block-preview" style={{width: "100%"}}>
      {!allowed && allowedOverlay}
      {debug && duration && <Text>{`duration: ${duration} ms`}</Text>}
      { Renderer
        ? <Renderer key="renderer" debug={debug} {...content} />
        : <Center style={{minHeight: 100}}><Badge key="type" color="gray" variant="outline">{blockType}</Badge></Center> }
      {debug && log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      {debug && error && <Textarea label="Error" minRows={3} value={error} />}
    </div>
  );

}

export default BlockPreview;
