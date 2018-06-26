import {SYMBOLS as OPERATOR_SYMBOLS} from "./operators";

export function isValidFilter(condition) {
  return (
    condition.type === "filter" &&
    !isNaN(condition.values[0]) &&
    OPERATOR_SYMBOLS[condition.operator]
  );
}

export function isValidCut(condition) {
  return condition.type === "cut" && condition.values.length > 0;
}
