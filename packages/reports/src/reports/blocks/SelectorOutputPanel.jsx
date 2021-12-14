/* react */
import React, {useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Textarea, Text} from "@mantine/core";
import {format} from "pretty-format";

/* components */
import GeneratorList from "./GeneratorList";
import ConsumerMenu from "../components/ConsumerMenu";

/* hooks */

/* css */
import "./SelectorOutputPanel.css";

/**
 *
 */
function SelectorOutputPanel({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);

  const variables = {};
  const log = "";

  const {codeEditor, executeButton, blockPreview} = components;

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {codeEditor}
        {executeButton}
        {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default SelectorOutputPanel;
