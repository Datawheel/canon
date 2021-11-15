// If a draftjs editor field ends with a trailing space, a &nbsp; is glommed onto the end of the field.
// Before persisting this to the db, strip out the trailing space if necessary
const stripTrail = d => typeof d === "string" ? d.replace(/\&nbsp;<\/p>/g, "</p>") : d;
// Further, if a field is left blank, draftjs sees it as <p><br></p>. Don't write this to the DB either.
const clearBlank = d => typeof d === "string" && d === "<p><br></p>" ? "" : d;
// Finally, strip off the leading and trailing p tags that the editor adds
const stripOuterTags = d => {
  if (d.substring(0, 3) === "<p>" && d.slice(-4) === "</p>") d = d.slice(3).slice(0, -4);
  return d;
};

module.exports = d => stripOuterTags(clearBlank(stripTrail(d)));
