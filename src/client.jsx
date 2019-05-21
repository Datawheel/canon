/* eslint react/display-name:0 */
import "babel-polyfill";

import React from "react";
import {render} from "react-dom";
import {createHistory} from "history";
import {applyRouterMiddleware, Router, RouterContext, useRouterHistory} from "react-router";
import {syncHistoryWithStore} from "react-router-redux";
import {animateScroll} from "react-scroll";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import createRoutes from "routes";
import configureStore from "./storeConfig";
import {LOADING_END, LOADING_START} from "./consts";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";

const {basename} = window.__INITIAL_STATE__.location;
const browserHistory = useRouterHistory(createHistory)({basename});
const store = configureStore(window.__INITIAL_STATE__, browserHistory);
const history = syncHistoryWithStore(browserHistory, store);
const routes = createRoutes(store);

import i18n from "i18next";
import yn from "yn";

import defaultTranslations from "./i18n/canon";
import CanonProvider from "./CanonProvider";

const {locale, resources} = window.__INITIAL_STATE__.i18n;
const {CANON_LOGLOCALE, NODE_ENV} = window.__INITIAL_STATE__.env;
const name = window.__APP_NAME__;

i18n
  .init({
    fallbackLng: "canon",
    lng: locale,
    debug: NODE_ENV !== "production" ? yn(CANON_LOGLOCALE) : false,
    ns: [name],
    defaultNS: name,
    react: {
      wait: true
    },
    resources: {
      [locale]: {[name]: resources},
      canon: {[name]: defaultTranslations}
    }
  });

/**
    Scrolls to a page element if it exists on the page.
*/
function scrollToHash(hash, wait = true) {
  const elem = hash && hash.indexOf("#") === 0 ? document.getElementById(hash.slice(1)) : false;
  if (elem) {
    const offset = elem.getBoundingClientRect().top;
    if (offset) {
      animateScroll.scrollMore(offset);
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

      const needs = props.components.filter(comp => comp && (comp.need || comp.preneed || comp.postneed));
      const {action, hash, pathname, query, search, state} = props.location;

      const postRender = function() {
        if (!window.__SSR__ && typeof window.ga === "function") {
          setTimeout(() => {
            window.ga("set", "title", document.title);
            window.ga("set", "page", pathname + search);
            window.ga("send", "pageview");
          }, 0);
        }
        if (hash) scrollToHash(hash);
        else window.scrollTo(0, 0);
      };

      if (action !== "REPLACE" || !Object.keys(query).length) {
        if (window.__SSR__ || state === "HASH" || !needs.length) {
          postRender();
          window.__SSR__ = false;
        }
        else {
          store.dispatch({type: LOADING_START});
          document.body.scrollTop = document.documentElement.scrollTop = 0;
          preRenderMiddleware(store, props)
            .then(() => {
              store.dispatch({type: LOADING_END});
              postRender();
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
    return <CanonProvider router={props.router} helmet={helmet} i18n={i18n}>
      <Component {...props} />
    </CanonProvider>;
  }
  else {
    return <Component {...props} />;
  }

}

render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <Router createElement={createElement} history={history} render={applyRouterMiddleware(renderMiddleware())}>
        {routes}
      </Router>
    </Provider>
  </I18nextProvider>,
  document.getElementById("React-Container"));
