import {CUBES_UPDATE} from "./actions";

/** @type {CubesState} */
export const cubesInitialState = {};

/** @type {import("redux").Reducer<CubesState>} */
export const cubesReducer = (state = cubesInitialState, {type, payload}) =>
  type === CUBES_UPDATE ? payload : state;
