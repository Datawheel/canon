import {chartsReducer} from "./charts/reducer";
import {cubesReducer} from "./cubes/reducer";
import {instanceInitialState, instanceReducer} from "./instance/reducer";
import {loadingInitialState, loadingReducer} from "./loading/reducer";
import {queryInitialState, queryReducer} from "./query/reducer";

/** @type {VizbuilderState} */
export const initialState = {
  charts: [],
  cubes: [],
  instance: instanceInitialState,
  loading: loadingInitialState,
  query: queryInitialState
};

export function vizbuilderReducer(state = initialState, action) {
  return {
    charts: chartsReducer(state.charts, action),
    cubes: cubesReducer(state.cubes, action),
    instance: instanceReducer(state.instance, action),
    loading: loadingReducer(state.loading, action),
    query: queryReducer(state.query, action)
  };
}
