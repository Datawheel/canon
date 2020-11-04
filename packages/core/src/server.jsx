/* global __TIMESTAMP__ */

import React from "react";
import Helmet from "react-helmet";
import {renderToString} from "react-dom/server";
import {ChunkExtractor, ChunkExtractorManager} from "@loadable/server";
import {createMemoryHistory, match, RouterContext} from "react-router";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import configureStore from "./storeConfig";
import createRoutes from "$app/routes";
import {initialState as appInitialState} from "$app/store";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";
import pretty from "pretty";

import CanonProvider from "./CanonProvider";

import jsesc from "jsesc";

import path from "path";
const appDir = process.cwd();
const statsFile = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets/loadable-stats.json");
const production = process.env.NODE_ENV === "production";

const tagManagerHead = process.env.CANON_GOOGLE_TAG_MANAGER === undefined ? ""
  : `
    <!-- Google Tag Manager -->
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${process.env.CANON_GOOGLE_TAG_MANAGER}');
    </script>
    <!-- End Google Tag Manager -->
    `;

const tagManagerBody = process.env.CANON_GOOGLE_TAG_MANAGER === undefined ? ""
  : `
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.CANON_GOOGLE_TAG_MANAGER}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->
    `;

const analtyicsScript = process.env.CANON_GOOGLE_ANALYTICS === undefined ? ""
  : `
    <!-- Google Analytics -->
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ${process.env.CANON_GOOGLE_ANALYTICS.split(",").map((key, i) => `ga('create', '${key}', 'auto', 'tracker${i + 1}');`).join("\n      ")}
      ${process.env.CANON_GOOGLE_ANALYTICS.split(",").map((key, i) => `ga('tracker${i + 1}.send', 'pageview');`).join("\n      ")}
    </script>
    <!-- End Google Analytics -->
    `;

const pixelScript = process.env.CANON_FACEBOOK_PIXEL === undefined ? ""
  : `
    <!-- Facebook Pixel -->
    <script> !function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){
      n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.CANON_FACEBOOK_PIXEL}'); fbq('track', 'PageView');
    </script>
    <!-- End Facebook Pixel -->
    `;

const hotjarScript = process.env.CANON_HOTJAR === undefined ? ""
  : `
    <!-- Hotjar -->
    <script>
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${process.env.CANON_HOTJAR},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    </script>
    <!-- End Hotjar -->
    `;

const BASE_URL = process.env.CANON_BASE_URL || "/";
const basename = BASE_URL.replace(/^[A-z]{4,5}\:\/{2}[A-z0-9\.\-]{1,}\:{0,}[0-9]{0,4}/g, "");
const baseTag = process.env.CANON_BASE_URL === undefined ? ""
  : `
    <base href='${ BASE_URL }'>`;

/**
    Returns the default server logic for rendering a page.
*/
export default function(defaultStore = appInitialState, headerConfig, reduxMiddleware = false) {

  return function(req, res) {

    const locale = req.i18n.language,
          resources = req.i18n.getResourceBundle(req.i18n.language);

    const windowLocation = {
      basename,
      host: req.headers.host,
      hostname: req.headers.host.split(":")[0],
      href: `${ req.protocol }://${ req.headers.host }${ req.url }`,
      origin: `${ req.protocol }://${ req.headers.host }`,
      pathname: req.url.split("?")[0],
      port: req.headers.host.includes(":") ? req.headers.host.split(":")[1] : "80",
      protocol: `${ req.protocol }:`,
      query: req.query,
      search: req.url.includes("?") ? `?${req.url.split("?")[1]}` : ""
    };

    const location = req.url.replace(BASE_URL, "");
    const history = createMemoryHistory({basename, entries: [location]});
    const store = configureStore({i18n: {locale, resources}, location: windowLocation, ...defaultStore}, history, reduxMiddleware);
    const routes = createRoutes(store);
    const rtl = ["ar", "he"].includes(locale);

    match({history, routes}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, `${redirect.basename}${redirect.pathname}${redirect.hash}${redirect.search}`);
      else if (props) {

        // detects components wrapped in @loadable/component,
        // and forces the load in order to detect needs
        const preloadComponents = props.components
          .map(comp => comp && comp.preload && comp.load ? comp.load() : false);

        Promise.all(preloadComponents)
          .then(comps => comps.map((loaded, i) => {
            const rawComp = props.components[i];
            return loaded ? rawComp.resolveComponent(loaded) : rawComp;
          }))
          .then(components => {

            const newProps = Object.assign({}, props, {components});

            // This method waits for all render component
            // promises to resolve before returning to browser
            preRenderMiddleware(store, newProps)
              .then(() => {

                // Needs may return a special canonRedirect key. If they do so, process a redirect, using the variables provided
                // in those objects as variables to substitute in the routes.
                const redirects = Object.values(store.getState().data).filter(d => d.canonRedirect);
                // If the query contains ?redirect=true, a redirect has already occurred. To avoid redirect loops, ensure this value is unset
                if (!req.query.redirect && redirects.length > 0) {
                  // If any needs provided redirect keys, combine them into one object.
                  const variables = redirects.reduce((acc, d) => ({...acc, ...d.canonRedirect}), {});
                  // Use variables given by the canonRedirect key, but fall back on given params (to cover for unprovided keys, like :lang)
                  const params = {...props.params, ...variables};
                  // Not sure if this is a reliable way to get which route this is.
                  let route = props.routes[1].path;
                  Object.keys(params).forEach(key => {
                    if (route.includes(`(/:${key})`)) {
                      route = route.replace(`(/:${key})`, params[key] ? `/${params[key]}` : "");
                    }
                    else if (route.includes(`:${key}`)) {
                      route = route.replace(`:${key}`, params[key]);
                    }
                  });
                  // Pass a ?redirect flag, to avoid a redirect loop
                  return res.redirect(301, `${route}?redirect=true`);
                }

                const header = Helmet.rewind();
                const htmlAttrs = header.htmlAttributes.toString().replace(" amp", "");

                const defaultAttrs = headerConfig.htmlAttributes ? Object.keys(headerConfig.htmlAttributes)
                  .map(key => {
                    const val = headerConfig.htmlAttributes[key];
                    return ` ${key}${val ? `="${val}"` : ""}`;
                  })
                  .join("") : "";

                let status = 200;
                const initialState = store.getState();
                for (const key in initialState.data) {
                  if ({}.hasOwnProperty.call(initialState.data, key)) {
                    const error = initialState.data[key] ? initialState.data[key].error : null;
                    if (error && typeof error === "number" && error > status) status = error;
                  }
                }

                let jsx;

                let componentHTML,
                    scriptTags = "<script type=\"text/javascript\" charset=\"utf-8\" src=\"/assets/client.js\"></script>",
                    styleTags = "<link rel=\"stylesheet\" type=\"text/css\" href=\"/assets/styles.css\">";

                if (production) {

                  const extractor = new ChunkExtractor({
                    statsFile,
                    entrypoints: ["client"]
                  });

                  jsx =
                    <I18nextProvider i18n={req.i18n}>
                      <Provider store={store}>
                        <CanonProvider helmet={headerConfig} locale={locale}>
                          <ChunkExtractorManager extractor={extractor}>
                            <RouterContext {...newProps} />
                          </ChunkExtractorManager>
                        </CanonProvider>
                      </Provider>
                    </I18nextProvider>;
                  // jsx = extractor.collectChunks(jsx);
                  componentHTML = renderToString(jsx);

                  scriptTags = extractor
                    .getScriptTags()
                    .replace(/\.js/g, `.js?v${__TIMESTAMP__}`)
                    .replace("script><script", "script>\n<script")
                    .replace(/\n/g, "\n    ");

                  styleTags = extractor
                    .getStyleTags()
                    .replace(/\.css/g, `.css?v${__TIMESTAMP__}`)
                    .split("\n")
                    .sort((a, b) => a.includes("normalize") ? -1 : a.includes("canon") && !b.includes("normalize") ? -1 : 1)
                    .join("\n    ");

                }
                else {
                  jsx =
                    <I18nextProvider i18n={req.i18n}>
                      <Provider store={store}>
                        <CanonProvider helmet={headerConfig} locale={locale}>
                          <RouterContext {...newProps} />
                        </CanonProvider>
                      </Provider>
                    </I18nextProvider>;
                  componentHTML = renderToString(jsx);
                }

                if (process.env.CANON_BASE_URL) {
                  scriptTags = scriptTags.replace(/\/assets\//g, "assets/");
                  styleTags = styleTags.replace(/\/assets\//g, "assets/");
                }

                const serialize = obj => `JSON.parse('${jsesc(JSON.stringify(obj))}')`;

                return res.status(status).send(`<!doctype html>
<html dir="${ rtl ? "rtl" : "ltr" }" ${htmlAttrs}${defaultAttrs}>
  <head>
    ${tagManagerHead}${pixelScript}${baseTag}
    ${ pretty(header.title.toString()).replace(/\n/g, "\n    ") }

    ${ pretty(header.meta.toString()).replace(/\n/g, "\n    ") }

    ${ pretty(header.link.toString()).replace(/\n/g, "\n    ") }

    ${styleTags}

    ${hotjarScript}
  </head>
  <body>
    ${tagManagerBody}
    <div id="React-Container">${ componentHTML }</div>

    <script>
      window.__SSR__ = true;
      window.__APP_NAME__ = "${ req.i18n.options.defaultNS }";
      window.__HELMET_DEFAULT__ = ${serialize(headerConfig)};
      window.__INITIAL_STATE__ = ${serialize(initialState)};
    </script>
    ${analtyicsScript}

    ${scriptTags}

  </body>
</html>`);
              })
              .catch(err => {
                res.status(500).send({error: err.toString(), stackTrace: err.stack.toString()});
              });

          });

      }
      else res.sendStatus(404);

    });
  };

}
