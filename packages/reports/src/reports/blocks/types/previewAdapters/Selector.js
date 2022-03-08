import {SELECTOR_TYPES} from "../../../../utils/consts/cms";
import valueInOptions from "../../../../utils/selectors/valueInOptions";

const validateOptionsArray = options => {
  if (!Array.isArray(options)) return [];
  return options.map(d => typeof d === "string" ? {id: d, label: d} : d);
};

const maybeFixForMulti = (defaultValue, type) => 
  type === SELECTOR_TYPES.MULTI && !Array.isArray(defaultValue)
    ? [defaultValue]
    : defaultValue;

/** @type {import(".").BlockPreviewAdapterFunction} */
export default (vars, id) => {

  const type = vars.type || SELECTOR_TYPES.SINGLE;
  const name = vars.name || "Unlabeled Selector";
  const options = validateOptionsArray(vars.options || []);
  let defaultValue;

  // check that given default is in options array
  if (vars.defaultValue) {
    const potentialDefaultValue = maybeFixForMulti(vars.defaultValue, type);
    if (valueInOptions(type, potentialDefaultValue, options)) defaultValue = potentialDefaultValue;
  }

  if (!defaultValue) {
    const fallbackValue = 
      options && options[0] && options[0].id ||
      options[0] ||
      "";
    defaultValue = maybeFixForMulti(fallbackValue, type);
  }

  return {id, name, type, options, defaultValue};
};
