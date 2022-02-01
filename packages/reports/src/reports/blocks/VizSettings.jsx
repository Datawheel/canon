/* react */
import React from "react";
import {Group} from "@mantine/core";

/* enums */
import {VIZ_SETTINGS} from "../../utils/consts/cms";

/* editors */
import AceWrapper from "../editors/AceWrapper";
import {useBlock} from "../hooks/blocks/selectors";

/**
 *
 */
function VizSettings({id, onChange}) {

  /* redux */
  const block = useBlock(id);
  const logic = block.content?.[VIZ_SETTINGS.VIZ_SETTINGS_LOGIC] || "";

  const handleChange = value => {
    onChange({[VIZ_SETTINGS.VIZ_SETTINGS_LOGIC]: value});
  };

  return (
    <Group direction="column">
      <span>Viz Options</span>
      <AceWrapper
        className="reports-allowed-editor"
        style={{width: 200, height: 200}}
        showGutter={false}
        key="code-editor"
        onChange={handleChange}
        defaultValue={logic}
      />
    </Group>
  );

}

export default VizSettings;
