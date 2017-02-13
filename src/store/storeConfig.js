import {createStore, applyMiddleware, compose} from "redux";
import {routerMiddleware} from "react-router-redux";
import thunk from "redux-thunk";
import rootReducer from "reducers";
import promiseMiddleware from "../middlewares/promiseMiddleware";
import createLogger from "redux-logger";

/**
    @param {Object} initialState initial state to bootstrap our stores with for server-side rendering
    @param {Object} history a history object. We use `createMemoryHistory` for server-side rendering, while using browserHistory for client-side rendering.
*/
export default function storeConfig(initialState, history) {
  // Installs hooks that always keep react-router and redux store in sync
  const middleware = [thunk, promiseMiddleware, routerMiddleware(history)];
  let store;

  if (__DEVCLIENT__) {
    middleware.push(createLogger());
    store = createStore(rootReducer, initialState, compose(
      applyMiddleware(...middleware),
      typeof window === "object" && typeof window.devToolsExtension !== "undefined" ? window.devToolsExtension() : f => f
    ));
  }
  else {
    store = createStore(rootReducer, initialState, compose(applyMiddleware(...middleware), f => f));
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
