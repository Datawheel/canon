import React from "react";

export default function preRenderMiddleware(store, {components, params}) {

  const data = store.data || {},
        dispatch = store.dispatch;

  function parseComponents(str) {
    return components
      .reduce((arr, component) => {
        (component[str] || []).forEach(n => {
          if (n.WrappedComponent) n = n.WrappedComponent;
          if (React.Component.isPrototypeOf(n)) arr = arr.concat(n[str] || []);
          else if (typeof n === "function") arr.push(n);
        });
        return arr;
      }, [])
      .filter(need => need.key && need.key in data ? false : (data[need.key] = "loading", true))
      .map(need => dispatch(need(params, store.getState())));
  }

  return Promise.all(parseComponents("preneed"))
    .then(() => Promise.all(parseComponents("need")))
    .then(() => Promise.all(parseComponents("postneed")));

}
