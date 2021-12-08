/* react */
import React, {useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Textarea, Text, Button} from "@mantine/core";

/* components */
import Viz from "./Viz";
import ConsumerMenu from "../components/ConsumerMenu";

/* hooks */

/* css */
import "./VizOutput.css";
import varSwapRecursive from "../../utils/varSwapRecursive";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function VizOutput({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.reports.entities.blocks[id]);

  const [logic, setLogic] = useState(components.codeEditor.props.defaultValue);
  const [config, setConfig] = useState({});

  const log = "";

  const onLocalChange = logic => {
    setLogic(logic);
    onChangeParent(logic);
  };

  // todo1.0 ask francisco about the performance implications of this
  const onChangeParent = components.codeEditor.props.onChange;
  const codeEditor = React.cloneElement(components.codeEditor, {onChange: onLocalChange});

  const renderViz = () => {
    // todo1.0 hook up formatters, variables, and query here!!
    const transpiledLogic = varSwapRecursive({logic}, {}, {}, {}).logic;
    setConfig({...config, logic: transpiledLogic});
  };

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {codeEditor}
        <Button onClick={renderViz}>Render</Button>
        {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        <ConsumerMenu id={id} />
        <Viz config={config} />
      </div>
    </div>
  );

}

export default VizOutput;
