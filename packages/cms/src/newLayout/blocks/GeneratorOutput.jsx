/* react */
import React, {useState} from "react";
import {Button, Intent, Icon} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

/* components */
import AceWrapper from "../../components/editors/AceWrapper";

/* css */
import "./GeneratorOutput.css";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function GeneratorOutput({id, editors}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => {
    const localeDefault = state.cms.status.localeDefault;
    return {localeDefault};
  });

  const {apiInput, codeEditor} = editors;

  return (
    <div className="cms-generator-output">
      {apiInput}
      {codeEditor}
    </div>
  );

}

export default GeneratorOutput;
