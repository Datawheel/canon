/* react */
import React, {useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Text} from "@mantine/core";
import {format} from "pretty-format";

/* components */
import GeneratorList from "../GeneratorList";

/* css */
import "./GeneratorOutput.css";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function GeneratorOutput({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.profiles.entities.blocks[id]);

  const onExecute = () => {

  };

  const {apiInput, codeEditor, executeButton} = components;

  const DURATION_CUTOFF_MS = {
    OK: 500,
    WARNING: 5000
  };

  const {response, duration, variables, log, durationColor} = useMemo(() => ({
    response: format(block._status.response, {printFunctionName: false}),
    duration: format(block._status.duration),
    variables: format(block._variables),
    log: block._status.error ? format(block._status.error) : block._status.log.join("\n"),
    durationColor: block._status.duration < DURATION_CUTOFF_MS.OK ? "green" : block._status.duration >= DURATION_CUTOFF_MS.OK && block._status.duration <= DURATION_CUTOFF_MS.WARNING ? "orange" : "red"
  }), [block]);

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {apiInput}
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        <GeneratorList label="API Response" description={<Text size="xs" color={durationColor}>Duration: {duration}ms</Text>} value={response} />
        <GeneratorList label="Generator Output" value={variables} />
        <GeneratorList label="Console Logs" value={log} />
      </div>
    </div>
  );

}

export default GeneratorOutput;
