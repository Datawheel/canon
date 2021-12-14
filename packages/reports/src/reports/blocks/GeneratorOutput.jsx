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
import "./GeneratorOutput.css";

/**
 *
 */
function GeneratorOutput({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.reports.entities.blocks[id]);

  const {apiInput, codeEditor, executeButton} = components;

  const LENGTH_CUTOFF_CHAR = 10000;

  const {variables, log, error, duration} = useMemo(() => {
    const variables = format(block._variables);
    const log = block._status.log ? block._status.log.map(d => format(d)).join("\n") : false;
    const error = block._status.error ? block._status.error : variables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${variables.length} chars)` : false;
    const duration = block._status.duration ? block._status.duration : false;
    return {variables, log, error, duration};
  }, [block]);

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {apiInput}
        {codeEditor}
        {executeButton}
        {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {duration && <Text>{`duration: ${duration} ms`}</Text>}
        <GeneratorList label="Output" value={variables} error={error}/>
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default GeneratorOutput;
