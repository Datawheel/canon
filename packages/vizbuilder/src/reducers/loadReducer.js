import {LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE} from "../actions/load";

const initialState = {
  inProgress: true,
  total: 1,
  done: 0,
  error: undefined
};

/** @type {import("redux").Reducer<LoadingState>} */
function loadReducer(state = initialState, {type, payload}) {
  if (type === LOAD_REQUEST) {
    return {
      inProgress: true,
      total: payload,
      done: 0,
      error: undefined
    };
  }
  else if (type === LOAD_SUCCESS) {
    const doneRequests = state.done + 1;
    return {
      inProgress: doneRequests < state.total,
      total: state.total,
      done: doneRequests,
      error: undefined
    };
  }
  else if (type === LOAD_FAILURE) {
    return {
      inProgress: false,
      total: state.total,
      done: state.done,
      error: payload
    };
  }

  return state;
}

export default loadReducer;
