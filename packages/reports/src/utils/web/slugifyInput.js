// Strip leading/trailing spaces and URL-breaking characters
module.exports = str => str.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
