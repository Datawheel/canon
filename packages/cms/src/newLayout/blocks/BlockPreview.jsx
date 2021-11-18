/* react */
import React from "react";
import {useSelector} from "react-redux";

/* utils */
import varSwapRecursive from "../../utils/varSwapRecursive";
import sanitizeBlockContent from "../../utils/sanitizeBlockContent";

/* css */
import "./BlockPreview.css";

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

  return (
    <div className="cms-block-preview">
      {Object.keys(content).map((d, i) => <span key={i}>{sanitizeBlockContent(content[d])}</span>)}
    </div>
  );

}

export default BlockPreview;
