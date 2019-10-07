import {chartsReducer, cubesReducer} from "./commonReducers";
import loadReducer from "./loadReducer";
import queryReducer from "./queryReducer";
import {initialState} from "./state";

function vizbuilderReducer(state = initialState, action) {
  return {
    charts: chartsReducer(state.charts, action),
    cubes: cubesReducer(state.cubes, action),
    instance: {},
    loading: loadReducer(state.loading, action),
    query: queryReducer(state.query, action)
  }
}

export default vizbuilderReducer
