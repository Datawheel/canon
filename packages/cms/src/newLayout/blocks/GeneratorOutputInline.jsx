import React, {useState} from "react";
import {Button, Intent, Icon} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

import "./GeneratorOutputInline.css";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function GeneratorOutputInline({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => {
    const localeDefault = state.cms.status.localeDefault;
    return {localeDefault};
  });

  return (
    <div className="cms-generator-output-inline">
      output for {id}
    </div>
  );

}

export default GeneratorOutputInline;
