/* react */
import React, {useState, useMemo} from "react";
import {useSelector} from "react-redux";
import {Select} from "@mantine/core";

/* redux */
import {updateEntity} from "../../actions/profiles";

/**
 *
 */
function BlockSettings({id, onChange}) {

  /* redux */
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);
  const block = blocks[id];

  const data = useMemo(() => {
    const variables = Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), {});
    return [{value: "always", label: "always"}].concat(Object.keys(variables).map(d => ({value: d, label: `${d}: ${variables[d]}`})));
  });

  const handleChange = (field, value) => {
    // onChange({[field]: value});
  };

  return (
    <div>
      <Select label="Allowed" defaultValue={block.settings.allowed || "always"} onChange={e => handleChange("allowed", e)} data={data} />
    </div>
  );

}

export default BlockSettings;
