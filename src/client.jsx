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

function onUpdate() {

  if (window.__INITIAL_STATE__ !== null) {
    window.__INITIAL_STATE__ = null;
    return;
  }

}

history.listen(location => {
  if (location.hash) {
    const offset = document.getElementById(location.hash.slice(1)).getBoundingClientRect().top;
    if (offset) animateScroll.scrollMore(offset);
  }
});

function firstRender(props) {
  if (props.location.hash) {
    const offset = document.getElementById(props.location.hash.slice(1)).getBoundingClientRect().top;
    if (offset) animateScroll.scrollMore(offset);
  }
  return <RouterContext {...props}/>;
}

render(
  <Provider store={store}>
    <Router history={history} onUpdate={onUpdate} render={firstRender}>
      {routes}
    </Router>
  </Provider>, document.getElementById("app"));
