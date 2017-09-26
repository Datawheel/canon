import {combineReducers, createStore, applyMiddleware, compose} from "redux";
import {routerMiddleware, routerReducer} from "react-router-redux";
import thunk from "redux-thunk";
import appReducers from "reducers";
import {createLogger} from "redux-logger";

import promiseMiddleware from "./middlewares/promiseMiddleware";

import auth from "./reducers/auth";
import fetchAttrs from "./reducers/fetchAttrs";
import fetchData from "./reducers/fetchData";
import loading from "./reducers/loading";

/**
    @param {Object} initialState initial state to bootstrap our stores with for server-side rendering
    @param {Object} history a history object. We use `createMemoryHistory` for server-side rendering, while using browserHistory for client-side rendering.
*/
export default function storeConfig(initialState, history) {

  // Installs hooks that always keep react-router and redux store in sync
  const middleware = [thunk, promiseMiddleware, routerMiddleware(history)];
  let store;

  const canonReducer = combineReducers(Object.assign({
    attrs: fetchAttrs,
    auth,
    data: fetchData,
    env: (state = {}) => state,
    i18n: (state = {}) => state,
    loading,
    location: (state = {}) => state,
    mailgun: (state = false) => state,
    routing: routerReducer,
    social: (state = []) => state
  }, appReducers));

  if (__DEVCLIENT__) {
    if (__LOGREDUX__) middleware.push(createLogger());
    store = createStore(canonReducer, initialState, compose(
      applyMiddleware(...middleware),
      typeof window === "object" && typeof window.devToolsExtension !== "undefined" ? window.devToolsExtension() : f => f
    ));
  }
  else {
    store = createStore(canonReducer, initialState, compose(applyMiddleware(...middleware), f => f));
  }

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("reducers", () => {
      const nextReducer = require("reducers");
      store.replaceReducer(nextReducer);
    });
  }

  return store;

}
