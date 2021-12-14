/* react */
import React, {useMemo, useState, useEffect} from "react";
import {Select} from "@mantine/core";

/* utils */
import mortarEval from "../../../utils/mortarEval";
import varSwapRecursive from "../../../utils/varSwapRecursive";
import scaffoldDynamic from "../../../utils/selectors/scaffoldDynamic";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({blockState, active, variables, locale, allowed}) {

  // what I need here is the materialized array
  const {config, log} = useMemo(() => {
    const {logic} = blockState.contentByLocale[locale].content;
    // todo1.0 formatters etc in here
    const transpiledLogic = varSwapRecursive({logic}, {}, variables, {}).logic;
    const selectorResult = mortarEval("variables", variables, transpiledLogic, {}, locale);
    const {vars, log} = selectorResult;
    const type = vars.type || "single";
    const name = vars.name || "Unlabeled Selector";
    const options = scaffoldDynamic(vars.options || []);
    const _default = vars._default || options[0]?.id || options[0] || "";
    const config = {name, type, options, _default};
    return {config, log};
  }, [blockState]);

  const [value, setValue] = useState(config._default);
  useEffect(() => setValue(config._default), [config]);

  const onChange = e => setValue(e);

  const {name} = config;
  const data = config.options.map(d => ({value: d.id, label: d.label}));

  return <div>
    <Select
      label={name}
      data={data}
      value={value}
      onChange={onChange}
    />
  </div>;
}
