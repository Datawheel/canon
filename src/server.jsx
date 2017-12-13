import "babel-polyfill";

import React from "react";
import ReactDOMServer from "react-dom/server";
import Helmet from "react-helmet";
import {renderToString} from "react-dom/server";
import {createMemoryHistory, match, RouterContext} from "react-router";
import {Provider} from "react-redux";
import createRoutes from "routes";
import configureStore from "./storeConfig";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";
import {I18nextProvider} from "react-i18next";

import serialize from "serialize-javascript";

const analtyicsScript = process.env.CANON_GOOGLE_ANALYTICS === undefined ? ""
  : `<script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${process.env.CANON_GOOGLE_ANALYTICS}', 'auto');
      ga('send', 'pageview');
    </script>`;

const cssLink = process.env.NODE_ENV === "production" ? "<link rel='stylesheet' type='text/css' href='/assets/styles.css'>" : "";

export default function(defaultStore = {}, i18n, headerConfig) {

  // Remove stylesheets because we do not extract them into a css file in development mode
  if (process.env.CANON_DEV === "development") {
    headerConfig.link = headerConfig.link.filter(l => l.rel !== "stylesheet");
  }

  return function(req, res) {

    function fetchResource(lng) {
      if (!lng) return undefined;
      if (lng.indexOf("-") === 2 || lng.indexOf("_") === 2) lng = lng.slice(0, 2);
      return [lng, i18n.getResourceBundle(lng, i18n.options.defaultNS)];
    }

    let locale, resources;
    if (req.headers.host.indexOf(".") > 0) {
      const ret = fetchResource(req.headers.host.split(".")[0]);
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }
    if (resources === undefined) {
      const ret = fetchResource(req.query.lang);
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }
    if (resources === undefined) {
      const ret = fetchResource(req.query.language);
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }
    if (resources === undefined) {
      const ret = fetchResource(req.query.locale);
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }
    if (resources === undefined) {
      const ret = fetchResource(req.language);
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }
    if (resources === undefined) {
      const ret = fetchResource(process.env.CANON_LANGUAGE_DEFAULT || "en");
      if (ret) {
        locale = ret[0];
        resources = ret[1];
      }
    }

    const location = {
      host: req.headers.host,
      hostname: req.headers.host.split(":")[0],
      href: `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }${ req.url }`,
      origin: `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`,
      pathname: req.url.split("?")[0],
      port: req.headers.host.includes(":") ? req.headers.host.split(":")[1] : "80",
      protocol: `http${ req.connection.encrypted ? "s" : "" }:`,
      query: req.query,
      search: req.url.includes("?") ? `?${req.url.split("?")[1]}` : ""
    };

    const i18nServer = i18n.cloneInstance();
    const history = createMemoryHistory();
    const store = configureStore({i18n: {locale, resources}, location, ...defaultStore}, history);
    const routes = createRoutes(store);
    i18nServer.changeLanguage(locale);
    const rtl = ["ar", "he"].includes(locale);

    const Meta = () =>
      <Helmet
        htmlAttributes={{lang: locale, amp: undefined}}
        defaultTitle={headerConfig.title} meta={headerConfig.meta}
        link={headerConfig.link} />;

    ReactDOMServer.renderToString(<Meta />);
    const header = Helmet.rewind();

    match({routes, location: req.url}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, redirect.pathname + redirect.search);
      else if (props) {
        // This method waits for all render component
        // promises to resolve before returning to browser
        preRenderMiddleware(store, props)
          .then(() => {
            const initialState = store.getState();
            const componentHTML = renderToString(
              <I18nextProvider i18n={i18nServer}>
                <Provider store={store}>
                  <RouterContext {...props} />
                </Provider>
              </I18nextProvider>
            );

            res.status(200).send(`
              <!doctype html>
              <html dir="${ rtl ? "rtl" : "ltr" }" ${header.htmlAttributes.toString()}>
                <head>
                  ${header.title.toString()}
                  ${header.meta.toString()}
                  ${header.link.toString()}
                  <link rel='stylesheet' type='text/css' href='/assets/normalize.css'>
                  <link rel='stylesheet' type='text/css' href='/assets/blueprint/dist/blueprint.css'>
                  ${cssLink}
                </head>
                <body>
                  <div id="app">${componentHTML}</div>
                  <script>
                    window.__SSR__ = true;
                    window.__INITIAL_STATE__ = ${ serialize(initialState) };
                    window.__APP_NAME__ = "${ i18n.options.defaultNS }";
                  </script>
                  ${analtyicsScript}
                  <script type="text/javascript" charset="utf-8" src="/assets/app.js"></script>
                </body>
              </html>
            `);
          })
          .catch(err => {
            res.status(500).send({error: err.toString(), stackTrace: err.stack.toString()});
          });
      }
      else res.sendStatus(404);

    });
  };

}
