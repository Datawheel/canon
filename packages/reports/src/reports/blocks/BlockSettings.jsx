/* react */
import React, {useMemo, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Select, Button, SegmentedControl, TextInput, Group, Checkbox} from "@mantine/core";

/* enums */
import {BLOCK_SETTINGS, BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";
import {useBlock} from "../hooks/blocks/selectors";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* utils */
import {useVariables} from "../hooks/blocks/useVariables";
import AceWrapper from "../editors/AceWrapper";
import VizSettings from "./VizSettings";

export const settings = {
  display: {
    label: "Display",
    defaultValue: "block",
    options: [
      {label: "block", value: "block"},
      {label: "inline", value: "inline"}
    ]
  },
  align: {
    label: "Align",
    defaultValue: "left",
    options: [
      {label: "left", value: "left"},
      {label: "center", value: "center"},
      {label: "right", value: "right"}
    ]
  }
};

/**
 *
 */
function BlockSettings({id, setBlockSettings, setBlockContent}) {

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  /* redux */

  const block = useBlock(id);

  /* state */
  const [width, setWidth] = useState(block.settings.width || "stretch");
  const [allowedLogic, setAllowedLogic] = useState(block.settings.allowedLogic);

  const {variables} = useVariables(id);

  const allowed = useMemo(() => [{value: "always", label: "always"}].concat(Object.keys(variables).map(d => ({value: d, label: `${d}: ${variables[d]}`}))), [variables]);
  const shared = [{label: "Section-wide", value: "false"}, {label: "Report-wide", value: "true"}];

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: "Delete this block and all its contents? This action cannot be undone.",
      confirmText: "Yes, Delete it."
    });
    if (confirmed) {
      dispatch(deleteEntity(ENTITY_TYPES.BLOCK, {id}));
    }
  };

  const handleChange = (field, value) => {
    setBlockSettings({[field]: value});
  };

  const handleChangeWidth = (stretch, value) => {
    const result = stretch ? value ? "stretch" : "300" : value;
    setWidth(result);
    handleChange("width", result);
  };

  const handleChangeAllowedLogic = logic => {
    setAllowedLogic(logic);
    handleChange(BLOCK_SETTINGS.ALLOWED_LOGIC, logic);
  };

  const handleChangeAllowedDropdown = allowed => {
    const allowedLogic = `return ${allowed === "always" ? "true" : `variables.${allowed}`};`;
    // These need to occur in the same setBlockSettings action to avoid a race condition
    setBlockSettings({
      [BLOCK_SETTINGS.ALLOWED]: allowed,
      [BLOCK_SETTINGS.ALLOWED_LOGIC]: allowedLogic
    });
    setAllowedLogic(allowedLogic);
  };

  return (
    <Group>
      <Group direction="column">
        <Select label="Allowed" defaultValue={block.settings[BLOCK_SETTINGS.ALLOWED] || "always"} onChange={handleChangeAllowedDropdown} data={allowed} />
        <AceWrapper
          className="reports-allowed-editor"
          style={{width: 200, height: 200}}
          showGutter={false}
          key="code-editor"
          onChange={handleChangeAllowedLogic}
          value={allowedLogic}
        />
        <span>Sharing</span>
        <SegmentedControl defaultValue={String(block.shared)} onChange={e => handleChange("shared", e === "true")} data={shared}/>
        <Button variant="outline" color="red" onClick={maybeDelete}>Delete Block</Button>
      </Group>
      <Group direction="column">
        <span>Layout Options</span>
        <Group direction="column">
          <TextInput label="width" error={width !== "stretch" && isNaN(width) ? "Width must be an integer" : ""} disabled={width === "stretch"} defaultValue={width} value={width} onChange={e => handleChangeWidth(false, e.target.value)} />
          <Checkbox label="stretch" checked={width === "stretch"} onChange={e => handleChangeWidth(true, e.target.checked)} />
        </Group>
        {
          Object.entries(settings).map(([key, {label, defaultValue, options}]) =>
            <React.Fragment key={key}>
              <span>{label}</span>
              <SegmentedControl defaultValue={String(block.settings[key] || defaultValue)} onChange={e => handleChange(key, e)} data={options} />
            </React.Fragment>
          )
        }
      </Group>
      {block.type === BLOCK_TYPES.VIZ &&
        <VizSettings id={id} onChange={setBlockContent}/>
      }
    </Group>
  );

}

export default BlockSettings;
