const jwt = require("jsonwebtoken");

/**
 * Apply OLAP_PROXY_SECRET to axios config
 */
module.exports = (opt = {}, env = process.env) => {
  const config = {};
  const {OLAP_PROXY_SECRET, CANON_REPORTS_MINIMUM_ROLE} = env;
  if (OLAP_PROXY_SECRET) {
    const jwtPayload = {sub: "server", status: "valid"};
    if (CANON_REPORTS_MINIMUM_ROLE) jwtPayload.auth_level = +CANON_REPORTS_MINIMUM_ROLE;
    const apiToken = jwt.sign(jwtPayload, OLAP_PROXY_SECRET, {expiresIn: "5y"});
    config.headers = {"x-tesseract-jwt-token": apiToken};
  }
  return {...config, ...opt};
};
