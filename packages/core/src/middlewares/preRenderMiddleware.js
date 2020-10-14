import React from "react";

/**
 * Handles running any "needs" on the component to be rendered.
 * @param {*} store
 * @param {*} param1
 */
export default function preRenderMiddleware(store, {components, params, location}) {

  const data = store.data || {},
        debug = process.env.NODE_ENV === "development",
        dispatch = store.dispatch,
        query = location.query || {};

  /**
   * Finds any static Arrays on a Component and runs their associated actions.
   * @param {*} str name of static Array
   */
  function parseComponents(str) {

    /** */
    function needListFlattening(arr, component) {
      (component[str] || []).forEach(n => {
        if (n.WrappedComponent) n = n.WrappedComponent;
        if (React.Component.isPrototypeOf(n)) arr = arr.concat(n[str] || []);
        else if (typeof n === "function") arr.push(n);
      });
      return arr;
    }

    /** */
    function needListFiltering(need) {
      return need.key && need.key in data ? false : (data[need.key] = "loading", true);
    }

    /** */
    function needListDispatching(need) {
      const action = need(params, store.getState(), query);
      if (typeof action.then === "function") {
        return action.then(module => {
          const needs = []
            .concat(module.default || [])
            .filter(Boolean)
            .reduce(needListFlattening, [])
            .filter(needListFiltering)
            .map(needListDispatching);
          return Promise.all(needs);
        });
      }
      if (debug && action.promise) {
        action.promise = action.promise.catch(err => {
          console.error(`\n\n 🛑  ${str.toUpperCase()} PROMISE ERROR\n`);
          if (action.description) console.error(`${action.description}\n`);
          console.error(err.stack);
        });
      }
      return dispatch(action);
    }

    return components
      .filter(Boolean)
      .reduce(needListFlattening, [])
      .filter(needListFiltering)
      .map(needListDispatching);
  }

  return Promise.all(parseComponents("preneed"))
    .then(() => Promise.all(parseComponents("need")))
    .then(() => Promise.all(parseComponents("postneed")));

}
