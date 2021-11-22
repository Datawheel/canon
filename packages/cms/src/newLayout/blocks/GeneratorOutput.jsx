/* react */
import React, {useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Text, Tab, Tabs} from "@mantine/core";
import {format} from "pretty-format";
import {VscWarning} from "react-icons/vsc";

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

  const LENGTH_CUTOFF_CHAR = 10000;

  const {response, duration, variables, log, durationColor, error} = useMemo(() => {
    const showConsole = block._status.log && block._status.log.length > 0;
    setActiveTab(showConsole ? 2 : 1);
    const response = format(block._status.response);
    const duration = format(block._status.duration);
    const variables = format(block._variables);
    const log = block._status.log ? block._status.log.join("\n") : false;
    const durationColor = duration < DURATION_CUTOFF_MS.OK ? "green" : duration >= DURATION_CUTOFF_MS.OK && duration <= DURATION_CUTOFF_MS.WARNING ? "orange" : "red";
    const error = [
      durationColor === "red" ? `Warning - Long Request Duration (${duration} ms)` : false,
      block._status.error ? block._status.error : variables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${response.length} chars)` : false,
      log ? "Warning - Remove console.log after debugging" : false
    ];
    return {response, duration, variables, log, durationColor, error};
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
          <Tab icon={(error[0] || durationColor === "red") && <VscWarning color="red"/>} label="Resp"><GeneratorList description={<Text size="xs" color={durationColor}>Request Duration: {duration}ms</Text>} value={response} error={error[activeTab]}/></Tab>
          <Tab icon={error[1] && <VscWarning color="red"/>}label="Output"><GeneratorList value={variables} error={error[activeTab]}/></Tab>
          <Tab icon={error[2] && <VscWarning color="red"/>}label="Console"><GeneratorList value={log} error={error[activeTab]}/></Tab>
        </Tabs>
      </div>
    </div>
  );

}

export default GeneratorOutput;
