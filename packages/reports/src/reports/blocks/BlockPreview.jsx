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

  const {block, blockState, active, variables, locale, allowed} = props;

  /* redux */
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  const LENGTH_CUTOFF_CHAR = 10000;

  // todo1.0 this is a pretty crazy statement, ask ryan about this

  const {content, error, log, duration} = useMemo(() => {
    const payload = {};
    if (block.type === BLOCK_TYPES.GENERATOR) {
      if (!active) return {content: {}, log: "", error: false, duration: false};
      payload.content = format(block._variables);
      payload.log = block._status && block._status.log ? block._status.log.map(d => format(d)).join("\n") : false;
      payload.error = block._status && block._status.error ? block._status.error : block._variables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${block._variables.length} chars)` : false;
      payload.duration = block._status && block._status.duration ? block._status.duration : false;
    }
    else if (block.type === BLOCK_TYPES.SELECTOR) {
      const resp = block._status && block._status.response ? block._status.response : {};
      const {config, log, error} = runSelector(blockState.contentByLocale[locale].content.logic, resp, variables, locale);
      payload.content = {id: block.id, config};
      payload.log = log.join("\n");
      payload.error = error;
      payload.duration = block._status && block._status.duration ? block._status.duration : false;
    }
    else if (block.type === BLOCK_TYPES.VIZ) {
      payload.content = props;
    }
    else {
      const resp = block._status && block._status.response ? block._status.response : {};
      const {vars, error, log} = mortarEval("resp", resp, blockState.contentByLocale[locale].content.logic, formatterFunctions[locale], locale, variables);
      payload.content = active
        ? varSwapRecursive(vars, formatterFunctions[locale], variables)
        : spoiler(vars);
      payload.log = log ? log.join("\n") : "";
      payload.error = error;
      payload.duration = block._status && block._status.duration ? block._status.duration : false;
    }
    return payload;
  }, [block, blockState, active]);

  const Renderer = TypeRenderers[blockState.type];

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", top: -1, left: -1, opacity: 0.3, zIndex: 5, pointerEvents: "none"};
  const allowedOverlay = <div style={{...overlayStyle, backgroundColor: "pink"}}></div>;

  return (
    <div className="cms-block-preview">
      {!allowed && allowedOverlay}
      {duration && <Text>{`duration: ${duration} ms`}</Text>}
      { Renderer
        ? <Renderer key="renderer" debug={true} {...content} />
        : <Center><Badge key="type" color="gray" variant="outline">{blockState.type}</Badge></Center> }
      {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      {error && <Textarea label="Error" minRows={3} value={error} />}
    </div>
  );

}

export default BlockPreview;
