import {CHARTS_UPDATE, CUBES_UPDATE, INSTANCE_UPDATE} from "../actions/common";

export const chartsReducer = (state = [], {type, payload}) =>
  type === CHARTS_UPDATE ? payload : state;

export const cubesReducer = (state = [], {type, payload}) =>
  type === CUBES_UPDATE ? payload : state;

export const instanceReducer = (state = {}, {type, payload}) =>
  type === INSTANCE_UPDATE ? payload : state;
