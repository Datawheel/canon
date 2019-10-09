import {CHARTS_UPDATE} from "./actions";

/**
 * @type {import("redux").Reducer<Chart[]>}
 */
export const chartsReducer = (state = [], {type, payload}) =>
  type === CHARTS_UPDATE ? payload : state;
