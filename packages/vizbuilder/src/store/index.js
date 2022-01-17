import {chartsInitialState, chartsReducer} from "./charts/reducer";
import {cubesInitialState, cubesReducer} from "./cubes/reducer";
import {instanceInitialState, instanceReducer} from "./instance/reducer";
import {loadingInitialState, loadingReducer} from "./loading/reducer";
import {queryInitialState, queryReducer} from "./query/reducer";

/** @type {VizbuilderState} */
export const initialState = {
  charts: chartsInitialState,
  cubes: cubesInitialState,
  instance: instanceInitialState,
  loading: loadingInitialState,
  query: queryInitialState
};

/**
 * Main reducer function for Vizbuilder's redux store.
 * @param {VizbuilderState} state
 * @param {import("redux").AnyAction} action
 */
export function vizbuilderReducer(state = initialState, action) {
  return {
    charts: chartsReducer(state.charts, action),
    cubes: cubesReducer(state.cubes, action),
    instance: instanceReducer(state.instance, action),
    loading: loadingReducer(state.loading, action),
    query: queryReducer(state.query, action)
  };
}
