export const PROPNAMESTYLES = {
  LVL: 1,
  HIE: 2,
  HIELVL: 3,
  DIM: 4,
  DIMLVL: 5,
  DIMHIE: 6,
  DIMHIELVL: 7
};

/**
 * For a drilldown, generates a standard name format to use in selectors.
 * @param {Level|Measure} item A Level or Measure object
 * @param {number?} style A combination available from the PROPNAMESTYLES enum
 * @returns {string}
 */
export function composePropertyName(item, style = PROPNAMESTYLES.DIMHIELVL) {
  let txt = style & PROPNAMESTYLES.LVL ? item.name : "";
  if ("hierarchy" in item) {
    const hname = item.hierarchy.name;
    const dname = item.hierarchy.dimension.name;
    if (style & PROPNAMESTYLES.HIE && hname !== item.name && hname !== dname) {
      txt = `${item.hierarchy.name} › ${txt}`;
    }
    if (style & PROPNAMESTYLES.DIM && dname !== item.name) {
      txt = `${dname} › ${txt}`;
    }
  }
  return txt;
}

/**
 * Returns the first number it finds in a `string`, else returns `elseValue`.
 * @param {string} string The string to test
 * @param {number} elseValue A value to return in case the string doesn't contain any
 */
export function findFirstNumber(string, elseValue) {
  return (`${string}`.match(/[0-9\.\,]+/) || [elseValue])[0] * 1;
}

/**
 * Joins a list of strings to form an enumeration phrase of type "a, b, c, and d".
 * @param {string[]} list List of strings to join
 */
export function joinStringsWithCommaAnd(list) {
  const copy = list.slice();
  const last = copy.pop();
  return copy.length > 1
    ? `${copy.join(", ")}, and ${last}`
    : list.join(" and ");
}

/* this function will probably change soon */
export function composeChartTitle(query, subtitle, levels) {
  const {level, measure, timeLevel, xlevel} = query;
  let title = `${measure.name} by `;

  const allLevels = levels || [level.name, xlevel && xlevel.name];
  title += joinStringsWithCommaAnd(allLevels.filter(Boolean));

  if (timeLevel) {
    title += `, by ${timeLevel.name}`;
  }

  return `${title}\n${subtitle}`
}
