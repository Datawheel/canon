/**
 * Takes a section layout & returns the corresponding icon name
 */
function sectionIconLookup(layout, isSticky) {
  if (isSticky) return "pin";

  if (layout === "Hero") return "mugshot";
  if (layout === "Grouping") return "projects";
  if (layout === "Card" || layout === "InfoCard") return "id-number";
  if (layout === "Column" || layout === "SingleColumn") return "horizontal-distribution";
  if (layout === "Columns" || layout === "MultiColumn") return "alignment-top";
  if (layout === "Tabs") return "segmented-control";

  // default
  return "list-detail-view";
}

module.exports = sectionIconLookup;
