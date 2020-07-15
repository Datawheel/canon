import {LOAD_FAILURE, LOAD_REQUEST, LOAD_SUCCESS} from "./actions";

/** @type {LoadingState} */
export const loadingInitialState = {
  done: 0,
  errorMsg: undefined,
  errorName: undefined,
  inProgress: true,
  total: 1
};

/** @type {import("redux").Reducer<LoadingState>} */
export function loadingReducer(state = loadingInitialState, {type, payload}) {
  if (type === LOAD_REQUEST) {
    return {
      done: 0,
      errorMsg: undefined,
      errorName: undefined,
      inProgress: true,
      total: payload
    };
  }
  else if (type === LOAD_SUCCESS) {
    const doneRequests = state.done + 1;
    return {
      done: doneRequests,
      errorMsg: undefined,
      errorName: undefined,
      inProgress: doneRequests < state.total,
      total: state.total
    };
  }
  else if (type === LOAD_FAILURE) {
    return {
      done: state.done,
      errorMsg: payload.message,
      errorName: payload.name,
      inProgress: false,
      total: state.total
    };
  }

  return state;
}
