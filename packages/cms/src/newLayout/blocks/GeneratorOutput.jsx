/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";

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

  const {apiInput, codeEditor} = components;

  return (
    <div className="cms-generator-output">
      {apiInput}
      {codeEditor}
    </div>
  );

}

export default GeneratorOutput;
