import {SELECTOR_TYPES} from "../../../../utils/consts/cms";
import scaffoldDynamic from "../../../../utils/selectors/scaffoldDynamic";
import valueInOptions from "../../../../utils/selectors/valueInOptions";

/** @type {import(".").BlockPreviewAdapterFunction} */
export default vars => {
  const type = vars.type || SELECTOR_TYPES.SINGLE;
  const name = vars.name || "Unlabeled Selector";
  const options = scaffoldDynamic(vars.options || []);

  const maybeFixForMulti = defaultValue => 
    type === SELECTOR_TYPES.MULTI && !Array.isArray(defaultValue)
      ? [defaultValue]
      : defaultValue;
  
  let potentialDefaultValue = vars.defaultValue;
  let defaultValue;
  
  if (potentialDefaultValue) {
    potentialDefaultValue = maybeFixForMulti(potentialDefaultValue);
    if (valueInOptions(type, potentialDefaultValue, options)) defaultValue = potentialDefaultValue;
  }

  if (!defaultValue) {
    const fallbackValue = 
      options && options[0] && options[0].id ||
      options[0] ||
      "";
    defaultValue = maybeFixForMulti(fallbackValue);
  }

  console.log("Preview adapter input", vars, "output", {name, type, options, defaultValue});

  return {name, type, options, defaultValue};
};
