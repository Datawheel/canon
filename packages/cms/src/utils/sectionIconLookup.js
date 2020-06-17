/**
 * Takes a section layout & returns the corresponding icon name
 */
function sectionIconLookup(layout, position) {
  if (position === "sticky") return "pin";
  if (position === "modal") return "applications";

  if (layout === "Hero") return "mugshot";
  if (layout === "Grouping") return "caret-right";
  if (layout === "Card") return "id-number";
  if (layout === "Column" || layout === "SingleColumn") return "horizontal-distribution";
  if (layout === "Columns" || layout === "MultiColumn") return "alignment-top";
  if (layout === "Tabs") return "segmented-control";

  // default
  return "list-detail-view";
}

module.exports = sectionIconLookup;
