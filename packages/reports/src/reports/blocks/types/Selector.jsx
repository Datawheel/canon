/* react */
import React, {useMemo, useState, useEffect} from "react";
import {useDispatch} from "react-redux";
import {Select} from "@mantine/core";

/* utils */
import mortarEval from "../../../utils/mortarEval";
import varSwapRecursive from "../../../utils/varSwapRecursive";
import scaffoldDynamic from "../../../utils/selectors/scaffoldDynamic";
import runSelector from "../../../utils/selectors/runSelector";

/* hooks */
import {setStatus} from "../../../actions/status";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({blockState, active, variables, locale, allowed}) {

  const dispatch = useDispatch();

  // what I need here is the materialized array
  const {config, log} = useMemo(() => runSelector(blockState.contentByLocale[locale].content.logic, variables, locale), [blockState]);

  const [value, setValue] = useState(config._default);
  // useEffect(() => setValue(config._default), [config]);

  const onChange = e => {
    dispatch(setStatus({query: {[`selector${blockState.id}`]: e}}));
    setValue(e);
  };

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
