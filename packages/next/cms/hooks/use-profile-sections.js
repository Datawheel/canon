

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
export default function useProfileSections(profile, comparison, t) {
  const {sections} = profile;
  // find Hero section
  const heroSection = sections.find(l => l.type === "Hero");

  const comparisonSections = [];

  if (comparison) {
    const comparifySection = (rawSection, payload) => ({

      ...rawSection,

      comparison: payload === comparison,

      // suffix "id" and "slug" keys with "-compare" so that anchor looks do not clash
      id: payload === profile ? rawSection.id : `${rawSection.id}-compare`,
      slug: `${rawSection.slug || `section-${rawSection.id}`}${payload === comparison ? "-compare" : ""}`,

      // add member names to each section title to help
      // differentiate the two comparitors
      title: rawSection.title.includes(payload.variables.name)
        ? rawSection.title
        : rawSection.title.replace(/\<\/p\>$/g, ` ${t("CMS.Profile.in")} ${payload.variables.name}</p>`)

    });

    sections
      .reduce((arr, rawSection) => {

        const comp = comparison.sections.find(s => s.id === rawSection.id);
        if (comp) {

          const section = comparifySection(rawSection, profile);
          const newComp = comparifySection(comp, comparison);
          comparisonSections.push([[section, newComp]]);

          if (arr.length === 0 || rawSection.type === "Grouping") arr.push([[rawSection]]);
          else arr[arr.length - 1].push([rawSection]);

        }

        return arr;

      }, []);

  }
  // function used to clone and modify a raw "section" in order
  // to prep it to be viewed side-by-side with a comparitor section
  // with similar content

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

  return {heroSection, groupedSections, comparisonSections};
}
