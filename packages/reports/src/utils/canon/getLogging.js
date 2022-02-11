const yn = require("yn");

module.exports = (env = process.env) => yn(env.CANON_REPORTS_LOGGING);
