import {SYMBOLS as OPERATOR_SYMBOLS} from "./operators";

export const isWindowAvailable = typeof window !== "undefined";

export function isValidCondition(condition) {
  return isValidFilter(condition) || isValidCut(condition);
}

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
