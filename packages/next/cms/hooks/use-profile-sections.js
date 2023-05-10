

const groupableSections = ["SingleColumn"];
// const groupableSections = ["SingleColumn"].concat(Object.keys(CustomSections)); // sections to be grouped together

/**
 * Groups consecutive groupable sections into same-type arrays
*/
function groupInnerSections(groupedSections, section) {

  const lastGroup = groupedSections[groupedSections.length - 1];
  const currType = section.type;

  // if its the first section return group
  if (groupedSections.length === 0) return [...groupedSections, [section]];

  const prevType = lastGroup[lastGroup.length - 1]?.type;

  // group if last sections are the same (and groupable) type
  const groupable = groupableSections.includes(prevType) &&
                    groupableSections.includes(currType) &&
                    prevType === currType;


  if (groupable) {
    // add to last group
    return [
      ...groupedSections.slice(0, -1),
      [...lastGroup, section]
    ];
  }

  // create new group with just this section
  return [...groupedSections, [section]];
}

/** */
function groupOuterSections(groupedSections, innerGroup) {
  const lastGroup = groupedSections[groupedSections.length - 1];
  const lastGroupType = lastGroup && lastGroup.length ? lastGroup[0][0].type : undefined;

  // if incoming section is a grouping section, there is no grouping section above or is the first section, create a new group
  if (
    innerGroup[0].type === "Grouping" ||
    lastGroupType !== "Grouping" ||
    !groupedSections.length
  ) return [...groupedSections, [innerGroup]];

  // else add to last group
  return [...groupedSections.slice(0, -1), [...lastGroup, innerGroup]];
}

/** */
export default function useProfileSections(sections) {
  // find Hero section
  const heroSection = sections.find(l => l.type === "Hero");

  // filter modal and hero sections from the rest of the report
  const renderSections = sections
    .filter(l => l.type !== "Hero" && l.position !== "modal")
    .map(l => {
    // rename old section names
      const slug = l.slug ?? `section-${l.id}`;
      if (l.type === "TextViz" || l.position === "sticky") return {...l, type: "Default", slug};
      if (l.type === "Column") return {...l, type: "SingleColumn", slug};
      return {...l, slug};
    });


  const innerGroups = renderSections
    .reduce(groupInnerSections, []);
  const groupedSections = innerGroups.reduce(groupOuterSections, []);

  return {heroSection, renderSections, groupedSections};
}
