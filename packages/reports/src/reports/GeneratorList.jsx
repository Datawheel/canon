import React, {useState} from "react";

import {Textarea} from "@mantine/core";

import "./GeneratorList.css";

/**
 *
 */
function GeneratorList(props) {

  return (
    <div>
      <Textarea
        {...props}
        style={{width: 300}}
        styles={{input: {fontFamily: "monospace"}}}
        size="xs"
        autosize
        minRows={33}
      />
    </div>
  );

}

export default GeneratorList;
