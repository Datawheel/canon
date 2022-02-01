/* react */
import React from "react";
import {Col, Grid} from "@mantine/core";

/* css */
import "./BlockOutputPanel.css";

/**
 *
 */
function BlockOutputPanel({components, mode}) {

  const {codeEditor, executeButton, blockPreview, uiEditor} = components;

  return (
    <Grid className="cr-block-output" style={{flex: 1, width: "100%"}}>
      <Col span={8} className={`cr-block-output-editor ${mode}`}>
        {mode === "code"
          ? <React.Fragment>
            {codeEditor}
            {executeButton}
          </React.Fragment>
          : uiEditor
        }
      </Col>
      <Col span={4} style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
      </Col>
    </Grid>
  );

}

export default BlockOutputPanel;
