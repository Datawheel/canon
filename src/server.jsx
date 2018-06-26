import "babel-polyfill";

import React from "react";
import Helmet from "react-helmet";
import {renderToString} from "react-dom/server";
import {createMemoryHistory, match, RouterContext} from "react-router";
import createRoutes from "routes";
import configureStore from "./storeConfig";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";
import pretty from "pretty";

import CanonProvider from "./CanonProvider";

import serialize from "serialize-javascript";

const BASE_URL = process.env.CANON_BASE_URL || "/";
const basename = BASE_URL.replace(/^[A-z]{4,5}\:\/{2}[A-z0-9\.\-]{1,}\:{0,}[0-9]{0,4}/g, "");

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
  : `<!-- Google Analytics -->
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${process.env.CANON_GOOGLE_ANALYTICS}', 'auto');
      ga('send', 'pageview');
    </script>
    <!-- End Google Analytics -->`;

const pixelScript = process.env.CANON_FACEBOOK_PIXEL === undefined ? ""
  : `<!-- Facebook Pixel -->
  <script> !function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){
    n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${process.env.CANON_FACEBOOK_PIXEL}'); fbq('track', 'PageView');
  </script>
  <!-- End Facebook Pixel -->`;

export default function(defaultStore = {}, headerConfig) {

  return function(req, res) {

    const locale = req.i18n.language,
          resources = req.i18n.getResourceBundle(req.i18n.language);

    const windowLocation = {
      basename,
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

    const location = req.url.replace(BASE_URL, "");
    const history = createMemoryHistory({basename, entries: [location]});
    const store = configureStore({i18n: {locale, resources}, location: windowLocation, ...defaultStore}, history);
    const routes = createRoutes(store);
    const rtl = ["ar", "he"].includes(locale);

    match({history, routes}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, redirect.pathname + redirect.search);
      else if (props) {
        // This method waits for all render component
        // promises to resolve before returning to browser
        preRenderMiddleware(store, props)
          .then(() => {
            const initialState = store.getState();
            const componentHTML = renderToString(
              <CanonProvider helmet={headerConfig} i18n={req.i18n} locale={locale} store={store}>
                <RouterContext {...props} />
              </CanonProvider>
            );

            const header = Helmet.rewind();

            res.status(200).send(`<!doctype html>
<html dir="${ rtl ? "rtl" : "ltr" }" ${header.htmlAttributes.toString()}>
  <head>
    ${tagManagerHead}
    ${pixelScript}
    ${ process.env.CANON_BASE_URL ? `<base href='${ BASE_URL }'>` : "" }

    ${ pretty(header.title.toString()).replace(/\n/g, "\n    ") }

    ${ pretty(header.meta.toString()).replace(/\n/g, "\n    ") }

    ${ pretty(header.link.toString()).replace(/\n/g, "\n    ") }

    <link rel='stylesheet' type='text/css' href='${ process.env.CANON_BASE_URL ? "" : "/" }assets/normalize.css'>
    <link rel='stylesheet' type='text/css' href='${ process.env.CANON_BASE_URL ? "" : "/" }assets/blueprint/dist/blueprint.css'>
    <link rel='stylesheet' type='text/css' href='${ process.env.CANON_BASE_URL ? "" : "/" }assets/styles.css'>
  </head>
  <body>
    ${tagManagerBody}
    <div id="React-Container">${ componentHTML }</div>

    <script>
      window.__SSR__ = true;
      window.__APP_NAME__ = "${ req.i18n.options.defaultNS }";
      window.__HELMET_DEFAULT__ = ${ serialize(headerConfig, {isJSON: true, space: 2}).replace(/\n/g, "\n      ") };
      window.__INITIAL_STATE__ = ${ serialize(initialState, {isJSON: true, space: 2}).replace(/\n/g, "\n      ") };
    </script>

    ${analtyicsScript}


    <script type="text/javascript" charset="utf-8" src="${ process.env.CANON_BASE_URL ? "" : "/" }assets/app.js"></script>
  </body>
</html>`);
          })
          .catch(err => {
            res.status(500).send({error: err.toString(), stackTrace: err.stack.toString()});
          });
      }
      else res.sendStatus(404);

    });
  };

}
