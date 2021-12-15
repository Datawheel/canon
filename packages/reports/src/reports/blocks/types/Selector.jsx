/* react */
import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Select} from "@mantine/core";

/* utils */
import runSelector from "../../../utils/selectors/runSelector";

/* hooks */
import {setStatus} from "../../../actions/status";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({blockState, active, variables, locale, allowed}) {

  const dispatch = useDispatch();

  const query = useSelector(state => state.cms.status.query);
  const {config, log} = useMemo(() => runSelector(blockState.contentByLocale[locale].content.logic, variables, locale), [blockState]);

  const [value, setValue] = useState(query[`selector${blockState.id}id`] || config._default);

  const onChange = e => {
    dispatch(setStatus({query: {[`selector${blockState.id}id`]: e}}));
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
