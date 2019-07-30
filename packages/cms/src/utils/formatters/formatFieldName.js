const upperCaseFirst = require("./upperCaseFirst");

/**
 * Removes all HTML tags from a string and converts <br> tags to spaces.
 */
function formatFieldName(field, contentType) {

  // stats
  if (contentType.toLowerCase() === "stat") {
    if (field === "title") return "Stat label";
    if (field === "value") return "Stat value";
    if (field === "subtitle") return "Stat subtitle";
    if (field === "tooltip") return "Tooltip text";
  }

  // paragraphs
  if (contentType.toLowerCase() === "description") {
    if (field === "description") return "Paragraph";
  }

  // everything else
  return upperCaseFirst(field);
}

module.exports = formatFieldName;
