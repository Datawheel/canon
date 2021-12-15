const {SELECTOR_TYPES} = require("../consts/cms");
const mortarEval = require("../variables/mortarEval");
const varSwapRecursive = require("../variables/varSwapRecursive");
const scaffoldDynamic = require("./scaffoldDynamic");

const runSelector = (logic, variables, locale) => {
  // todo1.0 formatters etc in here
  const transpiledLogic = varSwapRecursive({logic}, {}, variables, {}).logic;
  const evalResult = mortarEval("variables", variables, transpiledLogic, {}, locale);
  const {vars, log} = evalResult;
  const type = vars.type || SELECTOR_TYPES.SINGLE;
  const name = vars.name || "Unlabeled Selector";
  const options = scaffoldDynamic(vars.options || []);
  const defaultValue = vars.defaultValue
    ? vars.defaultValue
    : options[0] && options[0].id
      ? options[0].id
      : options[0]
        ? options[0]
        : "";
  const config = {name, type, options, defaultValue};
  return {config, log};
};

module.exports = runSelector;
