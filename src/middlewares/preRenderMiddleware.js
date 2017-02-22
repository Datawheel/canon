import React from "react";

export default (dispatch, components, params) => Promise.all(
  components
    .reduce((arr, component) => {
      (component.need || []).forEach(n => {
        if (React.Component.isPrototypeOf(n)) arr = arr.concat(n.need);
        else if (typeof n === "function") arr.push(n);
      });
      return arr;
    }, [])
    .map(need => dispatch(need(params))));
