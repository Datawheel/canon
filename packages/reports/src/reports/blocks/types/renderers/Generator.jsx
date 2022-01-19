import React from "react";
import {Textarea, Center, Badge} from "@mantine/core";

/**
 *
 */
function Generator({outputVariables, debug}) {

  if (!debug) return <Center><Badge key="type" color="gray" variant="outline">GENERATOR</Badge></Center>;

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
