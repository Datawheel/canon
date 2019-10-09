import {CUBES_UPDATE} from "./actions";

export const cubesReducer = (state = [], {type, payload}) =>
  type === CUBES_UPDATE ? payload : state;
