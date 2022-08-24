/* global __TIMESTAMP__ */

import React from "react";
import {HelmetProvider} from "react-helmet-async";
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
import maybeRedirect from "./helpers/maybeRedirect";
import stripHTML from "./helpers/stripHTML";
import {servicesAvailable, servicesBody, servicesScript, servicesHeadTags} from "./helpers/services";
import yn from "yn";

import CanonProvider from "./CanonProvider";

import jsesc from "jsesc";

import path from "path";
const appDir = process.cwd();
const statsFile = path.join(appDir, process.env.CANON_STATIC_FOLDER || "static", "assets/loadable-stats.json");
const production = process.env.NODE_ENV === "production";

const GDPR = yn(process.env.CANON_GDPR) && servicesScript.length;
const BASE_URL = process.env.CANON_BASE_URL || "/";
const basename = BASE_URL.replace(/^[A-z]{4,5}\:\/{2}[A-z0-9\.\-]{1,}\:{0,}[0-9]{0,4}/g, "");
const baseTag = process.env.CANON_BASE_URL === undefined ? ""
  : `
    <base href='${BASE_URL}'>`;


const getCleanedParams = queryParams => {
  return Object.keys(queryParams).reduce((params, paramKey) => {
    params[stripHTML(paramKey)] = stripHTML(queryParams[paramKey]);
    return params;
  }, {})
}
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
      href: `${req.protocol}://${stripHTML(`${req.headers.host}${req.url}`)}`,
      origin: `${req.protocol}://${req.headers.host}`,
      pathname: stripHTML(req.url.split("?")[0]),
      port: req.headers.host.includes(":") ? req.headers.host.split(":")[1] : "80",
      protocol: `${req.protocol}:`,
      query: getCleanedParams(req.query),
      search: req.url.includes("?") ? `?${stripHTML(req.url.split("?")[1])}` : ""
    };

    const location = req.url.replace(BASE_URL, "");
    const history = createMemoryHistory({basename, entries: [location]});

    const store = configureStore({
      i18n: {locale, resources},
      location: windowLocation,
      services: servicesAvailable,
      ...defaultStore
    }, history, reduxMiddleware);

    const routes = createRoutes(store);
    const rtl = ["ar", "he"].includes(locale);

    match({history, routes}, (err, redirect, props) => {

      if (err) res.status(500).json(err);
      else if (redirect) res.redirect(302, `${redirect.basename}${redirect.pathname}${redirect.hash}${redirect.search}`);
      else if (props) {
        // get the `status` property for the last matched route
        const routeStatus = props.routes
          .map(route => route.status * 1)
          .filter(code => !isNaN(code) && code > 200)
          .pop();

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

                const initialState = store.getState();

                const idRedirect = maybeRedirect(req.query, props, initialState);
                if (idRedirect) return res.redirect(301, idRedirect);

                let status = 200;
                for (const key in initialState.data) {
                  if ({}.hasOwnProperty.call(initialState.data, key)) {
                    const error = initialState.data[key] ? initialState.data[key].error : null;
                    if (error && typeof error === "number" && error > status) status = error;
                  }
                }
                // eslint-disable-next-line eqeqeq
                if (routeStatus != null) {
                  status = routeStatus;
                }

                let jsx;

                const helmetContext = {};

                let componentHTML,
                    scriptTags = "<script type=\"text/javascript\" charset=\"utf-8\" src=\"/assets/client.js\"></script>",
                    styleTags = "<link rel=\"stylesheet\" type=\"text/css\" href=\"/assets/styles.css\">";

                if (production) {

                  const extractor = new ChunkExtractor({
                    statsFile,
                    entrypoints: ["client"]
                  });

                  jsx =
                    <HelmetProvider context={helmetContext}>
                      <I18nextProvider i18n={req.i18n}>
                        <Provider store={store}>
                          <CanonProvider helmet={headerConfig} locale={locale}>
                            <ChunkExtractorManager extractor={extractor}>
                              <RouterContext {...newProps} />
                            </ChunkExtractorManager>
                          </CanonProvider>
                        </Provider>
                      </I18nextProvider>
                    </HelmetProvider>;
                  // jsx = extractor.collectChunks(jsx);
                  componentHTML = renderToString(jsx);

                  scriptTags = extractor
                    .getScriptTags()
                    .replace(/\.js/g, `.js?v${__TIMESTAMP__}`)
                    .replace("script><script", "script>\n<script")
                    .replace(/\n/g, "\n    ");

                  const cssOrder = ["normalize", "blueprint", "canon"];
                  const cssRegex = RegExp(`(?:${cssOrder.join("|")})`);

                  styleTags = extractor
                    .getStyleTags()
                    .replace(/\.css/g, `.css?v${__TIMESTAMP__}`)
                    .split("\n")
                    .sort((a, b) => {
                      const aIndex = cssRegex.test(a) ? cssOrder.indexOf(a.match(cssRegex)[0]) : cssOrder.length;
                      const bIndex = cssRegex.test(b) ? cssOrder.indexOf(b.match(cssRegex)[0]) : cssOrder.length;
                      return aIndex - bIndex;
                    })
                    .join("\n    ");

                }
                else {
                  jsx =
                    <HelmetProvider context={helmetContext}>
                      <I18nextProvider i18n={req.i18n}>
                        <Provider store={store}>
                          <CanonProvider helmet={headerConfig} locale={locale}>
                            <RouterContext {...newProps} />
                          </CanonProvider>
                        </Provider>
                      </I18nextProvider>
                    </HelmetProvider>;
                  componentHTML = renderToString(jsx);
                }

                const header = helmetContext.helmet;
                const htmlAttrs = header.htmlAttributes.toString().replace(" amp", "");

                const defaultAttrs = headerConfig.htmlAttributes ? Object.keys(headerConfig.htmlAttributes)
                  .map(key => {
                    const val = headerConfig.htmlAttributes[key];
                    return ` ${key}${val ? `="${val}"` : ""}`;
                  })
                  .join("") : "";

                if (process.env.CANON_BASE_URL) {
                  scriptTags = scriptTags.replace(/\/assets\//g, "assets/");
                  styleTags = styleTags.replace(/\/assets\//g, "assets/");
                }

                const serialize = obj => `JSON.parse('${jsesc(JSON.stringify(obj), {isScriptContext: true})}')`;

                return res.status(status).send(`<!doctype html>
<html dir="${rtl ? "rtl" : "ltr"}" ${htmlAttrs}${defaultAttrs}>
  <head>

    ${baseTag}

    ${servicesHeadTags}

    ${pretty(header.title.toString()).replace(/\n/g, "\n    ")}

    ${pretty(header.meta.toString()).replace(/\n/g, "\n    ")}

    ${pretty(header.link.toString()).replace(/\n/g, "\n    ")}

    ${styleTags}

  </head>
  <body>
    ${servicesBody}
    <div id="React-Container">${componentHTML}</div>

    <script>

      window.__SSR__ = true;
      window.__APP_NAME__ = "${req.i18n.options.defaultNS}";
      window.__HELMET_DEFAULT__ = ${serialize(headerConfig)};
      window.__INITIAL_STATE__ = ${serialize(initialState)};
      ${GDPR ? `
      if (typeof window !== "undefined") {

        /** Cookies EU banner v2.0.1 by Alex-D - alex-d.github.io/Cookies-EU-banner/ - MIT License */
        !function(e,t){"use strict";"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.CookiesEuBanner=t()}(window,function(){"use strict";var i,u=window.document;return(i=function(e,t,o,n){if(!(this instanceof i))return new i(e);this.cookieTimeout=33696e6,this.bots=/bot|crawler|spider|crawling/i,this.cookieName="hasConsent",this.trackingCookiesNames=["__utma","__utmb","__utmc","__utmt","__utmv","__utmz","_ga","_gat","_gid"],this.launchFunction=e,this.waitAccept=t||!1,this.useLocalStorage=o||!1,this.init()}).prototype={init:function(){var e=this.bots.test(navigator.userAgent),t=navigator.doNotTrack||navigator.msDoNotTrack||window.doNotTrack;return e||!(null==t||t&&"yes"!==t&&1!==t&&"1"!==t)||!1===this.hasConsent()?(this.removeBanner(0),!1):!0===this.hasConsent()?(this.launchFunction(),!0):(this.showBanner(),void(this.waitAccept||this.setConsent(!0)))},showBanner:function(){var e=this,t=u.getElementById.bind(u),o=t("cookies-eu-banner"),n=t("cookies-eu-reject"),i=t("cookies-eu-accept"),s=t("cookies-eu-more"),a=void 0===o.dataset.waitRemove?0:parseInt(o.dataset.waitRemove),c=this.addClickListener,r=e.removeBanner.bind(e,a);o.style.display="block",s&&c(s,function(){e.deleteCookie(e.cookieName)}),i&&c(i,function(){r(),e.setConsent(!0),e.launchFunction()}),n&&c(n,function(){r(),e.setConsent(!1),e.trackingCookiesNames.map(e.deleteCookie)})},setConsent:function(e){if(this.useLocalStorage)return localStorage.setItem(this.cookieName,e);this.setCookie(this.cookieName,e)},hasConsent:function(){function e(e){return-1<u.cookie.indexOf(t+"="+e)||localStorage.getItem(t)===e}var t=this.cookieName;return!!e("true")||!e("false")&&null},setCookie:function(e,t){var o=new Date;o.setTime(o.getTime()+this.cookieTimeout),u.cookie=e+"="+t+";expires="+o.toGMTString()+";path=/"},deleteCookie:function(e){var t=u.location.hostname.replace(/^www\./,""),o="; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";u.cookie=e+"=; domain=."+t+o,u.cookie=e+"="+o},addClickListener:function(e,t){if(e.attachEvent)return e.attachEvent("onclick",t);e.addEventListener("click",t)},removeBanner:function(e){setTimeout(function(){var e=u.getElementById("cookies-eu-banner");e&&e.parentNode&&e.parentNode.removeChild(e)},e)}},i});

        var cookiesBanner = new CookiesEuBanner(function() {` : ""}
          ${servicesScript}
        ${GDPR ? `}, ${yn(process.env.CANON_GDPR_WAIT)});

      }

      // use the following command to reset your cookie:
      // cookiesBanner.deleteCookie(cookiesBanner.cookieName);
      ` : ""}
    </script>

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
