/* react */
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Center, Col, Grid, SegmentedControl, useMantineTheme} from "@mantine/core";
import {HiOutlineEye, HiOutlineCog} from "react-icons/hi";

/* components */
import VariableList from "./VariableList";
import InputMenu from "../components/InputMenu";

/**
 *
 */
function BlockEditor({id, panels}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const [tab, setTab] = useState("output");
  const theme = useMantineTheme();

  if (!block) return null;

  return (
    <Grid style={{height: "60vh"}}>
      <Col span={3} style={{display: "flex", flexDirection: "column"}}>
        <InputMenu id={id}/>
        <VariableList id={id}/>
      </Col>
      <Col span={9}>
        <Center>
          <SegmentedControl
            value={tab}
            onChange={setTab}
            data={[
              {
                label: <Center>
                  <HiOutlineEye />
                  <div style={{marginLeft: theme.spacing.sm}}>Content</div>
                </Center>,
                value: "output"
              },
              {
                label: <Center>
                  <HiOutlineCog />
                  <div style={{marginLeft: theme.spacing.sm}}>Settings</div>
                </Center>,
                value: "settings"
              }
            ]}
          />
        </Center>
        {{
          output: panels.blockOutputPanel,
          settings: panels.blockSettings
        }[tab]}
      </Col>
    </Grid>
  );

}

export default BlockEditor;