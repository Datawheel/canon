/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Select, MultiSelect} from "@mantine/core";

/* hooks */
import {deleteQueryParam, setQueryParam} from "../../../../actions/status";

/* utils */
import valueInOptions from "../../../../utils/selectors/valueInOptions";

/* consts */
import {SELECTOR_TYPES} from "../../../../utils/consts/cms";

/**
 * "selector" block renderer
*/
export default function SelectorPreview({id, config}) {

  const dispatch = useDispatch();

  const query = useSelector(state => state.cms.status.query);

  const [value, setValue] = useState(query[`selector${id}id`] || config.defaultValue);
  const [multiValue, setMultiValue] = useState(query[`selector${id}id`] ? query[`selector${id}id`].split(",") : config.defaultValue);
  const [data, setData] = useState(config.options?.map(d => ({value: d.id, label: d.label})) || []);
  const [serializedOptions, setSerializedOptions] = useState((config.options || []).map(d => d.id).join("-"));

  // change value if option list changes
  useEffect(() => {
    // options change ref when setStatus is called, so encode option content to compare equality 
    const serializedNew = config.options.map(d => d.id).join("-");
    if (serializedOptions === serializedNew) return;
    setSerializedOptions(serializedNew);

    const newOptions = config.options.map(d => ({value: d.id, label: d.label}));
    setData(newOptions);

    const relevantValue = config.type === SELECTOR_TYPES.SINGLE ? value : multiValue;
    const relevantSetter = config.type === SELECTOR_TYPES.SINGLE ? setValue : setMultiValue;

    // if the selected value is not in the new list of options...
    if (!valueInOptions(config.type, relevantValue, config.options)) {
      // set the value to the new default
      relevantSetter(config.defaultValue);
      // and remove the query params for this selector
      dispatch(deleteQueryParam(`selector${id}id`));
    }
  }, [config.options]);

  // when a selector is edited and saved, make sure to set the current value
  useEffect(() => {
    if (config.type === SELECTOR_TYPES.MULTI) {
      setMultiValue(query[`selector${id}id`] ? query[`selector${id}id`].split(",") : config.defaultValue);
    }
    else {
      setValue(query[`selector${id}id`] || config.defaultValue);
    }
  }, [config]);

  const onChangeSingle = e => {
    dispatch(setQueryParam(`selector${id}id`, e));
    setValue(e);
  };

  const onChangeMulti = e => {
    dispatch(setQueryParam(`selector${id}id`, e.join()));
    setMultiValue(e);
  };

  const {name} = config;

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