/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Select, MultiSelect} from "@mantine/core";

/* hooks */
import {setStatus} from "../../../../actions/status";
import {SELECTOR_TYPES} from "../../../../utils/consts/cms";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({id, config}) {

  const dispatch = useDispatch();

  const query = useSelector(state => state.cms.status.query);

  const [value, setValue] = useState(query[`selector${id}id`] || config.defaultValue);
  const [multiValue, setMultiValue] = useState(query[`selector${id}id`] ? query[`selector${id}id`].split(",") : config.defaultValue);

  const onChangeSingle = e => {
    dispatch(setStatus({query: {[`selector${id}id`]: e}}));
    setValue(e);
  };

  const onChangeMulti = e => {
    dispatch(setStatus({query: {[`selector${id}id`]: e.join()}}));
    setMultiValue(e);
  };

  useEffect(() => {
    if (config.type === SELECTOR_TYPES.MULTI) {
      setMultiValue(query[`selector${id}id`] ? query[`selector${id}id`].split(",") : config.defaultValue);
    }
    else {
      setValue(query[`selector${id}id`] || config.defaultValue);
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
