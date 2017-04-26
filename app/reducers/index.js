import {titleCase} from "d3plus-text";
import {dataFold} from "d3plus-viz";

export default {
  attrs: (state = {}) => {
    const lookup = {};
    for (const key in state) {
      if ({}.hasOwnProperty.call(state, key)) {
        if (state[key].data && state[key].headers) {
          lookup[key] = dataFold(state[key]).reduce((obj, d) => (d.name = titleCase(d.name), obj[d.id] = d, obj), {});
        }
        else lookup[key] = state[key];
      }
    }
    return lookup;
  }
};
