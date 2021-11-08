import React, {useState} from "react";
import {Button, Intent, Icon} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

import "./GeneratorOutput.css";

/**
 *
 */
function GeneratorOutput({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => {
    const localeDefault = state.cms.status.localeDefault;
    return {localeDefault};
  });

  return (
    <div className="cms-generator-output">
      output for {id}
    </div>
  );

}

export default GeneratorOutput;
