/**
 * @param {string} fullName
 * @returns {LevelLike}
 */
export function fullNameToLevelLike(fullName) {
  const match = fullName.match(/[^\]\.\[]+/);
  return !match
    ? {dimension: "", hierarchy: "", name: fullName}
    : match.length === 1
      ? {dimension: match[0], hierarchy: match[0], name: match[0]}
      : match.length === 2
        ? {dimension: match[0], hierarchy: "", name: match[1]}
        : {dimension: match[0], hierarchy: match[1], name: match[2]};
}
