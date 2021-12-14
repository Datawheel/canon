/* react */
import React, {useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Textarea, Text} from "@mantine/core";

/* components */
import Generator from "./types/Generator";
import ConsumerMenu from "../components/ConsumerMenu";

/* hooks */

/* css */
import "./GeneratorOutput.css";

/**
 *
 */
function GeneratorOutput({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.reports.entities.blocks[id]);

  const {apiInput, codeEditor, executeButton, blockPreview} = components;

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {apiInput}
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default GeneratorOutput;
