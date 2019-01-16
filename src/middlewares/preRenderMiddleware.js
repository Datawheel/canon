import React from "react";

export default function preRenderMiddleware(store, {components, params}) {
  const data = store.data || {},
    debug = process.env.NODE_ENV === "development",
    dispatch = store.dispatch;

  function parseComponents(str) {
    function needListFlattening(arr, component) {
      (component[str] || []).forEach(n => {
        if (n.WrappedComponent) n = n.WrappedComponent;
        if (React.Component.isPrototypeOf(n)) arr = arr.concat(n[str] || []);
        else if (typeof n === "function") arr.push(n);
      });
      return arr;
    }

    function needListFiltering(need) {
      return need.key && need.key in data ? false : ((data[need.key] = "loading"), true);
    }

    function needListDispatching(need) {
      const action = need(params, store.getState());
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
