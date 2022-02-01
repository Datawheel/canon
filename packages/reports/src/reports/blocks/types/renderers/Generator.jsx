import React from "react";
import {Badge, Center, Divider} from "@mantine/core";
import InputMenuItem from "../../../components/InputMenuItem";

/**
 *
 */
function Generator({outputVariables, debug}) {

  return debug
    ? <React.Fragment>
      <Divider label="Output Variables" labelPosition="center" />
      <InputMenuItem variables={outputVariables} />
    </React.Fragment>
    : <Center><Badge key="type" color="gray" variant="outline">GENERATOR</Badge></Center>;

}

export default Generator;
