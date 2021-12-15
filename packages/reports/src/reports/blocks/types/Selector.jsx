/* react */
import React, {useMemo, useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Select, MultiSelect} from "@mantine/core";

/* utils */
import runSelector from "../../../utils/selectors/runSelector";

/* hooks */
import {setStatus} from "../../../actions/status";
import {SELECTOR_TYPES} from "../../../utils/consts/cms";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({blockState, active, variables, locale, allowed}) {

  const dispatch = useDispatch();

  const query = useSelector(state => state.cms.status.query);
  const {config, log} = useMemo(() => runSelector(blockState.contentByLocale[locale].content.logic, variables, locale), [blockState]);

  const [value, setValue] = useState(query[`selector${blockState.id}id`] || config._default);
  const [multiValue, setMultiValue] = useState(query[`selector${blockState.id}id`] ? query[`selector${blockState.id}id`].split(",") : config._default);

  const onChangeSingle = e => {
    dispatch(setStatus({query: {[`selector${blockState.id}id`]: e}}));
    setValue(e);
  };

  const onChangeMulti = e => {
    dispatch(setStatus({query: {[`selector${blockState.id}id`]: e.join()}}));
    setMultiValue(e);
  };

  useEffect(() => {
    if (config.type === SELECTOR_TYPES.MULTI) {
      setMultiValue(query[`selector${blockState.id}id`] ? query[`selector${blockState.id}id`].split(",") : config._default);
    }
    else {
      setValue(query[`selector${blockState.id}id`] || config._default);
    }
  }, [config]);

  const {name} = config;
  const data = config.options.map(d => ({value: d.id, label: d.label}));

  return {
    [SELECTOR_TYPES.SINGLE]: <Select
      label={name}
      data={data}
      value={value}
      onChange={onChangeSingle}
    />,
    [SELECTOR_TYPES.MULTI]: <MultiSelect
      label={name}
      data={data}
      value={multiValue}
      onChange={onChangeMulti}
    />
  }[config.type];
}
