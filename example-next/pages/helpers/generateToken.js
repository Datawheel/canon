import jwt from "jsonwebtoken";

const {OLAP_PROXY_SECRET} = process.env;

// eslint-disable-next-line func-names
export default function() {
  return jwt.sign(
    {
      auth_level: 10,
      sub: "server",
      status: "valid"
    },
    OLAP_PROXY_SECRET,
    {expiresIn: "30m"}
  );
}
