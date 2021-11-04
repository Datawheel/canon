// If a draftjs editor field ends with a trailing space, a &nbsp; is glommed onto the end of the field.
// Before persisting this to the db, strip out the trailing space if necessary
const stripTrail = d => typeof d === "string" ? d.replace(/\&nbsp;<\/p>/g, "</p>") : d;
// Further, if a field is left blank, draftjs sees it as <p><br></p>. Don't write this to the DB either.
const clearBlank = d => typeof d === "string" && d === "<p><br></p>" ? "" : d;

module.exports = d => clearBlank(stripTrail(d));
