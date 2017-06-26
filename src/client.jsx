/* eslint react/display-name:0 */
import "babel-polyfill";

import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {applyRouterMiddleware, browserHistory, Router, RouterContext} from "react-router";
import {syncHistoryWithStore} from "react-router-redux";
import {animateScroll} from "react-scroll";
import createRoutes from "routes";
import configureStore from "./storeConfig";
import preRenderMiddleware from "./middlewares/preRenderMiddleware";

const store = configureStore(window.__INITIAL_STATE__, browserHistory);
const history = syncHistoryWithStore(browserHistory, store);
const routes = createRoutes(store);

import {I18nextProvider} from "react-i18next";
import i18n from "i18next";

const {locale, resources} = window.__INITIAL_STATE__.i18n;

i18n
  .init({
    fallbackLng: process.env.CANON_LANGUAGE_DEFAULT || "en",
    lng: locale,
    debug: process.env.CANON_ENV !== "production",
    ns: ["canon"],
    defaultNS: "canon",
    interpolation: {
      escapeValue: false // not needed for react!!
    }
  });

i18n.addResourceBundle(locale, "canon", resources, true, true);

function scrollToHash(hash) {
  const elem = hash && hash.indexOf("#") === 0 ? document.getElementById(hash.slice(1)) : false;
  if (elem) {
    const offset = elem.getBoundingClientRect().top;
    if (offset) animateScroll.scrollMore(offset);
  }
}

function renderMiddleware() {

  return {
    renderRouterContext: (child, props) => {

      if (window.__SSR__) {
        window.__SSR__ = false;
        scrollToHash(props.location.hash);
      }
      else if (!props.location.key && props.location.hash) {
        scrollToHash(props.location.hash);
      }
      else {
        store.dispatch({type: "LOADING_START"});
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        preRenderMiddleware(store, props)
          .then(() => {
            store.dispatch({type: "LOADING_END"});
            scrollToHash(props.location.hash);
          });
      }

      return <RouterContext {...props}/>;

    }

  };

}

render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <Router history={history} render={applyRouterMiddleware(renderMiddleware())}>
        {routes}
      </Router>
    </Provider>
  </I18nextProvider>, document.getElementById("app"));
