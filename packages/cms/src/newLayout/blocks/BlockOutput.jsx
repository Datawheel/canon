import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";

import BlockPreview from "./BlockPreview";
import NewRichTextEditor from "../editors/NewRichTextEditor";

import {BLOCK_MAP} from "../../utils/consts/cms";

import "./BlockOutput.css";

/**
 *
 */
function BlockOutput({block, textEditor}) {

  const fields = BLOCK_MAP[block.type];

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  return (
    <div className="cms-block-output">
      {textEditor}
      <BlockPreview block={block} />
    </div>
  );

}

export default BlockOutput;
