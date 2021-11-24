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
 * Block.jsx and directly passed "stateContent" from there, which represents the live-editing content.
 * Though instantiated in Block, it is not rendered until BlockOutput.
 */
function BlockPreview({id, stateContent, variables}) {

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.profiles.entities.blocks[id]);
  const formatterFunctions = useSelector(state => state.cms.resources.formatterFunctions);

  const content = varSwapRecursive(stateContent, formatterFunctions[localeDefault], variables);

  const Renderer = TypeRenderers[block.type];

  return (
    <div className="cms-block-preview">
      { Renderer
        ? <Renderer {...content} />
        : <Center><Badge color="gray" variant="outline">{block.type}</Badge></Center> }
    </div>
  );

}

export default BlockPreview;
