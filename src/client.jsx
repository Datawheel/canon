import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {browserHistory, Router, RouterContext} from "react-router";
import {syncHistoryWithStore} from "react-router-redux";
import {animateScroll} from "react-scroll";
import createRoutes from "routes";
import configureStore from "./store/storeConfig";

const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState, browserHistory);
const history = syncHistoryWithStore(browserHistory, store);
const routes = createRoutes(store);


import {I18nextProvider} from "react-i18next";
import i18n from "i18next";

i18n
  .init({
    fallbackLng: "en",
    lng: "en",
    debug: true,
    ns: ["canon"],
    defaultNS: "canon",
    interpolation: {
      escapeValue: false // not needed for react!!
    }
  });

i18n.changeLanguage(window.__i18ncanon.locale);
i18n.addResourceBundle(window.__i18ncanon.locale, "canon", window.__i18ncanon.resources, true);

function onUpdate() {

  if (window.__INITIAL_STATE__ !== null) {
    window.__INITIAL_STATE__ = null;
    return;
  }

}

function scrollToHash(hash) {
  const elem = hash && hash.indexOf("#") === 0 ? document.getElementById(hash.slice(1)) : false;
  if (elem) {
    const offset = elem.getBoundingClientRect().top;
    if (offset) animateScroll.scrollMore(offset);
  }
}

history.listen(location => {
  scrollToHash(location.hash);
});

function firstRender(props) {
  scrollToHash(props.location.hash);
  return <RouterContext {...props}/>;
}

render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <Router history={history} onUpdate={onUpdate} render={firstRender}>
        {routes}
      </Router>
    </Provider>
  </I18nextProvider>, document.getElementById("app"));
