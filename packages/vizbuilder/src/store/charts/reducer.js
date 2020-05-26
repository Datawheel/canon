import {CHARTS_UPDATE} from "./actions";

/** @type {ChartsState} */
export const chartsInitialState = [];

/**
 * @type {import("redux").Reducer<ChartsState>}
 */
export const chartsReducer = (state = chartsInitialState, {type, payload}) =>
  type === CHARTS_UPDATE ? payload : state;
