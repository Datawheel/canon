import React from "react";

export default ({data = {}, dispatch}, {components, params}) => Promise.all(
  components
    .reduce((arr, component) => {
      (component.need || []).forEach(n => {
        if (React.Component.isPrototypeOf(n)) arr = arr.concat(n.need);
        else if (typeof n === "function") arr.push(n);
      });
      return arr;
    }, [])
    .filter(need => need.key in data ? false : (data[need.key] = "loading", true))
    .map(need => dispatch(need(params, data))));
