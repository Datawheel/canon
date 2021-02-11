/* eslint react/display-name:0 */

import {setConfig} from "react-hot-loader";
setConfig({logLevel: "error", showReactDomPatchNotification: false});

import React from "react";
import {hydrate} from "react-dom";
import {loadableReady} from "@loadable/component";
import {createHistory} from "history";
import {HelmetProvider} from "react-helmet-async";
import {applyRouterMiddleware, Router, RouterContext, useRouterHistory} from "react-router";
import {syncHistoryWithStore} from "react-router-redux";
import {animateScroll} from "react-scroll";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {selectAll} from "d3-selection";
import createRoutes from "$app/routes";
import {middleware as reduxMiddleware} from "$app/store";
import configureStore from "./storeConfig";
import {LOADING_END, LOADING_START} from "./consts";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";
import styles from "$app/style.yml";

/**
 * Finds a Number value for a given style.yml string variable. The cssVarRegex
 * tests for nested CSS vars (ie. subnav-height: "var(--nav-height)") and resolves
 * as deep as needed. Fallback return value is 0.
 * @private
 */
function parseStyle(str) {
  const cssVarRegex = /var\(--([A-z\-]+)\)/g;
  let val = styles[str];
  while (cssVarRegex.exec(val)) {
    str = val.replace(/var\(--([A-z\-]+)\)/g, "$1");
    val = styles[str];
  }
  return parseFloat(val) || 0;
}

const {basename} = window.__INITIAL_STATE__.location;
const browserHistory = useRouterHistory(createHistory)({basename});

const store = configureStore(window.__INITIAL_STATE__, browserHistory, reduxMiddleware);
const history = syncHistoryWithStore(browserHistory, store);
const routes = createRoutes(store);

import i18n from "i18next";
import yn from "yn";

import defaultTranslations from "./i18n/canon";
import CanonProvider from "./CanonProvider";

const {locale, resources} = window.__INITIAL_STATE__.i18n;
const {CANON_LOGLOCALE, NODE_ENV} = window.__INITIAL_STATE__.env;
const name = window.__APP_NAME__;

const resourceObj = {canon: {[name]: defaultTranslations}};
if (locale !== "canon") resourceObj[locale] = {[name]: resources};

i18n
  .init({
    fallbackLng: "canon",
    lng: locale,
    debug: NODE_ENV !== "production" ? yn(CANON_LOGLOCALE) : false,
    ns: [name],
    defaultNS: name,
    react: {
      wait: true,
      withRef: true
    },
    resources: resourceObj
  });

/**
    Scrolls to a page element if it exists on the page.
*/
function scrollToHash(hash, wait = true) {
  const elem = hash && hash.indexOf("#") === 0 ? document.getElementById(hash.slice(1)) : false;
  if (elem) {
    const offset = elem.getBoundingClientRect().top;
    if (offset) {
      animateScroll.scrollMore(offset - parseStyle("nav-height") - parseStyle("subnav-height") - 10);
      setTimeout(() => {
        elem.focus();
      }, 100);
    }
  }
  else if (wait) {
    setTimeout(() => {
      scrollToHash(hash, false);
    }, 100);
  }
}

/**
    Middleware that captures all router requests and detects the following:
      * Smooth scrolling to anchor links
      * Initiatlize SSR needs loading
*/
function renderMiddleware() {

  return {
    renderRouterContext: (child, props) => {

      const {location} = props;
      const needs = props.components.filter(comp => comp && (comp.need || comp.preneed || comp.postneed));
      const chunks = props.components.filter(comp => comp && comp.preload && comp.load);
      const {action, hash, pathname, query, search, state} = location;

      /** */
      function postRender() {
        if (!window.__SSR__) {
          if (typeof window.ga === "function") {
            setTimeout(() => {
              const trackers = window.ga.getAll().map(t => t.get("name"));
              trackers
                .forEach(key => {
                  window.ga(`${key}.set`, "title", document.title);
                  window.ga(`${key}.set`, "page", pathname + search);
                  window.ga(`${key}.send`, "pageview");
                });
            }, 0);
          }
        }
        if (hash) scrollToHash(hash);
        else window.scrollTo(0, 0);
      }

      if (action !== "REPLACE" || !Object.keys(query).length) {
        selectAll(".d3plus-tooltip").remove();
        if (window.__SSR__ || state === "HASH" || !needs.length && !chunks.length) {
          postRender();
          window.__SSR__ = false;
        }
        else {
          store.dispatch({type: LOADING_START});
          document.body.scrollTop = document.documentElement.scrollTop = 0;

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
              preRenderMiddleware(store, newProps)
                .then(() => {
                  store.dispatch({type: LOADING_END});
                  postRender();
                });
            });
        }
      }

      return <RouterContext {...props}/>;

    }
  };

}

const helmet = window.__HELMET_DEFAULT__;

/**
    Wraps the top-level router component in the CanonProvider
*/
function createElement(Component, props) {

  if (props.children && props.route.path === "/") {
    return <CanonProvider router={props.router} helmet={helmet} locale={locale}>
      <Component {...props} />
    </CanonProvider>;
  }
  else {
    return <Component {...props} />;
  }

}

const root = document.getElementById("React-Container");

hydrate(
  <HelmetProvider>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Router createElement={createElement} history={history} render={applyRouterMiddleware(renderMiddleware())}>
          {routes}
        </Router>
      </Provider>
    </I18nextProvider>
  </HelmetProvider>,
  root);
