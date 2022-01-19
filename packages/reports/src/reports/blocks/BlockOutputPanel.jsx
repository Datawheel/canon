/* react */
import React from "react";
import {Col, Grid, useMantineTheme} from "@mantine/core";
import {useBlock} from "../hooks/blocks/selectors";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockOutputPanel.css";

/**
 *
 */
function BlockOutputPanel({id, components, mode}) {

  /* redux */
  // const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blockType = useBlock(id)?.type;

  const {apiInput, codeEditor, executeButton, blockPreview, uiEditor} = components;

  const theme = useMantineTheme();

  return (
    <Grid className="cr-block-output" style={{flex: 1, marginTop: theme.spacing.md, width: "100%"}}>
      <Col span={7} className={`cr-block-output-editor ${mode}`}>
        {mode === "code"
          ? <React.Fragment>
            {blockType === BLOCK_TYPES.GENERATOR && apiInput}
            {codeEditor}
            {executeButton}
          </React.Fragment>
          : uiEditor
        }
      </Col>
      <Col span={5} style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
      </Col>
    </Grid>
  );

}

export default BlockOutputPanel;
