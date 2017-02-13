import React from "react";
import ReactDOMServer from "react-dom/server";
import Helmet from "react-helmet";

import config from "helmet.js";

// Remove stylesheets because we do not extract them into a css file in development mode
if (process.env.NODE_DEV === "development") {
  config.link = config.link.filter(l => l.rel !== "stylesheet");
}

const Meta = () =>
  <Helmet
    htmlAttributes={{lang: "en", amp: undefined}}
    defaultTitle="Data Africa" meta={config.meta}
    link={config.link} />;


ReactDOMServer.renderToString(<Meta />);
const header = Helmet.rewind();

export default header;
