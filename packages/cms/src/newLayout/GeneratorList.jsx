import React, {useState} from "react";

import {JsonInput} from "@mantine/core";

import "./GeneratorList.css";

/**
 *
 */
function GeneratorList({label, json}) {

  return (
    <div>
      <JsonInput
        label={label}
        autosize
        formatOnBlur
        defaultValue={json}
        minRows={10}
      />
    </div>
  );

}

export default GeneratorList;
