import React from "react";
import {renderToString} from "react-dom/server";
import {createMemoryHistory, match, RouterContext} from "react-router";
import {Provider} from "react-redux";
import createRoutes from "routes";
import configureStore from "./store/storeConfig";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";
import {I18nextProvider} from "react-i18next";

import serialize from "serialize-javascript";

import header from "./components/Meta";

const analtyicsScript = process.env.GOOGLE_ANALYTICS === undefined ? ""
  : `<script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${process.env.GOOGLE_ANALYTICS}', 'auto');
      ga('send', 'pageview');
    </script>`;

const cssLink = process.env.NODE_ENV === "production" ? "<link rel='stylesheet' type='text/css' href='/assets/styles.css'>" : "";

export default function(defaultStore = {}, i18n) {

  return function(req, res) {

    const history = createMemoryHistory();
    const store = configureStore(defaultStore, history);
    const routes = createRoutes(store);

    function fetchResource(lng) {
      let bundle = i18n.getResourceBundle(lng, "canon");
      if (!bundle && lng.indexOf("-") === 2 || lng.indexOf("_") === 2) bundle = i18n.getResourceBundle(lng.slice(0, 2), "canon");
      return bundle;
    }

    let locale, resources;
    if (req.headers.host.indexOf(".") > 0) {
      locale = req.headers.host.split(".")[0];
      resources = fetchResource(locale);
    }

    if (resources === undefined) {
      locale = req.language;
      resources = fetchResource(locale);
    }

    if (resources === undefined) {
      locale = process.env.LANGUAGE_DEFAULT || "en";
      resources = fetchResource(locale);
    }

    const i18nClient = {locale, resources};
    const i18nServer = i18n.cloneInstance();
    i18nServer.changeLanguage(locale);

    match({routes, location: req.url}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, redirect.pathname + redirect.search);
      else if (props) {
        // This method waits for all render component
        // promises to resolve before returning to browser
        preRenderMiddleware(store.dispatch, props.components, props.params)
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
              <html ${header.htmlAttributes.toString()}>
                <head>
                  ${header.title.toString()}
                  ${header.meta.toString()}
                  ${header.link.toString()}
                  ${cssLink}
                </head>
                <body>
                  <div id="app">${componentHTML}</div>
                  <script>window.__i18ncanon = ${ serialize(i18nClient) };</script>
                  <script>window.__INITIAL_STATE__ = ${ serialize(initialState) };</script>
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
