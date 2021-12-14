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

  return (
    <div>selector editor</div>
  );

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {apiInput}
        {codeEditor}
        {executeButton}
        {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        <GeneratorList label="Output" value={variables} error={error}/>
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default SelectorOutputPanel;
