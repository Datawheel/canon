import {LOAD_FAILURE, LOAD_REQUEST, LOAD_SUCCESS} from "./actions";

/** @type {LoadingState} */
export const loadingInitialState = {
  done: 0,
  error: undefined,
  inProgress: true,
  total: 1
};

/** @type {import("redux").Reducer<LoadingState>} */
export function loadingReducer(state = loadingInitialState, {type, payload}) {
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
