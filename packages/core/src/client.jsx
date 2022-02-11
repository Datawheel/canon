/* eslint react/display-name:0 */

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
import maybeRedirect from "./helpers/maybeRedirect";
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
const {CANON_LOGLOCALE, NODE_ENV, CANON_GOOGLE_OPTIMIZE} = window.__INITIAL_STATE__.env;
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

let scrollTimeout;

/**
    Scrolls to a page element if it exists on the page.
*/
function scrollToHash(hash, tries = 0) {

  const maxTries = 5;
  clearTimeout(scrollTimeout);

  const elem = hash && hash.indexOf("#") === 0 ? document.getElementById(hash.slice(1)) : false;

  if (elem) {
    const top = elem.getBoundingClientRect().top;
    if (top) {

      const offset = Math.round(top - parseStyle("nav-height") - parseStyle("subnav-height"));

      // if the element is not at zero, scroll to it's position
      if (offset !== 0) {
        animateScroll.scrollMore(offset, {
          duration: Math.abs(offset) < window.innerHeight ? 200 : 0
        });
      }

      // if the element is not focused, focus it!
      if (elem !== document.activeElement) elem.focus();

      // retry this whole process a few times, just in case
      // elements above it change height onLoad and push
      // the element up or down
      if (tries < maxTries) {
        scrollTimeout = setTimeout(() => {
          scrollToHash(hash, tries + 1);
        }, 200);
      }

    }
  }
  // if no element on the page has the requested hash,
  // retry again in 100ms (could be added via JavaScript)
  else if (tries < maxTries) {
    scrollTimeout = setTimeout(() => {
      scrollToHash(hash, tries + 1);
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

      //Launch Optimize activation event if client side navigation
      function launchOptimizeEvent() {
        if (CANON_GOOGLE_OPTIMIZE && !window.__SSR__ && window.dataLayer) {
          window.dataLayer.push({'event': 'optimize.activate'});
        }
      }

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
        launchOptimizeEvent();
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
                  const idRedirect = maybeRedirect(query, props, store.getState());
                  if (idRedirect) props.router.push(idRedirect);
                  postRender();
                });
            });
        }
      }

      return <RouterContext {...props} />;

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
