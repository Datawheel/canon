/* react */
import React, {useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Text, Tab, Tabs} from "@mantine/core";
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

  const [activeTab, setActiveTab] = useState(0);

  const {apiInput, codeEditor, executeButton} = components;

  const DURATION_CUTOFF_MS = {
    OK: 500,
    WARNING: 5000
  };

  const {response, duration, variables, log, error, durationColor} = useMemo(() => {
    const showConsole = block._status.log && block._status.log.length > 0;
    setActiveTab(showConsole ? 2 : 1);
    const response = format(block._status.response, {printFunctionName: false});
    const duration = format(block._status.duration);
    const variables = format(block._variables);
    const error = block._status.error;
    const log = block._status.log ? block._status.log.join("\n") : [];
    const durationColor = duration < DURATION_CUTOFF_MS.OK ? "green" : duration >= DURATION_CUTOFF_MS.OK && duration <= DURATION_CUTOFF_MS.WARNING ? "orange" : "red";
    return {response, duration, error, variables, log, durationColor};
  }, [block]);

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {apiInput}
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        <Tabs active={activeTab} onTabChange={setActiveTab}>
          <Tab label="Response"><GeneratorList description={<Text size="xs" color={durationColor}>Duration: {duration}ms</Text>} value={response} /></Tab>
          <Tab label="Output"><GeneratorList value={variables} error={error}/></Tab>
          <Tab label="Console"><GeneratorList value={log} error={error}/></Tab>
        </Tabs>
      </div>
    </div>
  );

}

export default GeneratorOutput;
