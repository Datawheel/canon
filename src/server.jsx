import React from "react";
import {renderToString} from "react-dom/server";
import {createMemoryHistory, match, RouterContext} from "react-router";
import {Provider} from "react-redux";
import createRoutes from "routes";
import configureStore from "./store/storeConfig";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";

import header from "./components/Meta";
import {GOOGLE_ANALYTICS, NODE_ENV} from ".env";

const analtyicsScript = GOOGLE_ANALYTICS === void 0 ? ""
  : `<script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${GOOGLE_ANALYTICS}', 'auto');
      ga('send', 'pageview');
    </script>`;

const cssLink = NODE_ENV === "production" ? "<link rel='stylesheet' type='text/css' href='/assets/styles.css'>" : "";

export default function(defaultStore = {}) {

  return function(req, res) {

    const history = createMemoryHistory();
    const store = configureStore(defaultStore, history);
    const routes = createRoutes(store);

    match({routes, location: req.url}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, redirect.pathname + redirect.search);
      else if (props) {
        // This method waits for all render component
        // promises to resolve before returning to browser
        preRenderMiddleware(
          store.dispatch,
          props.components,
          props.params
        )
        .then(() => {
          const initialState = store.getState();
          const componentHTML = renderToString(
            <Provider store={store}>
              <RouterContext {...props} />
            </Provider>
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
                <script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>
                ${analtyicsScript}
                <script type="text/javascript" charset="utf-8" src="/assets/app.js"></script>
              </body>
            </html>
          `);
        })
        .catch(err => res.status(500).json(err));
      }
      else res.sendStatus(404);

    });
  };

}
