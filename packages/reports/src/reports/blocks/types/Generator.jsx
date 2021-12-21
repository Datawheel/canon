import React from "react";
import {Textarea} from "@mantine/core";

/**
 *
 */
function Generator({outputVariables}) {

  return (
    <div>
      <Textarea
        label="Output"
        value={outputVariables}
        style={{width: 300}}
        styles={{input: {fontFamily: "monospace"}}}
        size="xs"
        autosize
        minRows={10}
      />
    </div>
  );

}

export default Generator;
