/* global __DEV__ */
/* global __SERVER__ */

import {combineReducers, createStore, applyMiddleware, compose} from "redux";
import {routerMiddleware, routerReducer} from "react-router-redux";
import thunk from "redux-thunk";

import promiseMiddleware from "./middlewares/promiseMiddleware";

import auth from "./reducers/auth";
import fetchData from "./reducers/fetchData";
import loading from "./reducers/loading";
import loadingProgress from "./reducers/loadingProgress";

import {reducers as appReducers} from "$app/store";

/**
    @param {Object} initialState initial state to bootstrap our stores with for server-side rendering
    @param {Object} history a history object. We use `createMemoryHistory` for server-side rendering, while using browserHistory for client-side rendering.
*/
export default function storeConfig(initialState, history, reduxMiddleware = false) {

  // Installs hooks that always keep react-router and redux store in sync
  const middleware = [thunk, promiseMiddleware, routerMiddleware(history)];
  if (Array.isArray(reduxMiddleware)) {
    middleware.push(...reduxMiddleware);
  }

  const canonReducer = combineReducers(Object.assign({
    auth,
    data: fetchData,
    env: (state = {}) => state,
    i18n: (state = {}) => state,
    legal: (state = {}) => state,
    loading,
    loadingProgress,
    location: (state = {}) => state,
    mailgun: (state = false) => state,
    routing: routerReducer,
    services: (state = []) => state,
    social: (state = []) => state
  }, appReducers));

  const composeEnhancers =
    __DEV__ && !__SERVER__ && typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  // Custom middleware
  const middlewareEnhancer = applyMiddleware(...middleware);
  const enhancers = composeEnhancers(middlewareEnhancer);
  const store = createStore(canonReducer, initialState, enhancers);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("$app/store", () => {
      const nextReducer = require("$app/store");
      store.replaceReducer(nextReducer);
    });
  }

  return store;

}
