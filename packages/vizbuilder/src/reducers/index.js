import initialState from "../state";

/**
 * Merges state objects up to 1 level deep in the overall state.
 * If the value is an Array, is replaced without merge. Else it will be merged.
 * @param {object} state The initial state
 * @param {object} newState The new state to merge
 */
export function mergeStates(state, newState) {
  const finalState = {...state};
  const keys = Object.keys(newState);

  let n = keys.length;
  while (n--) {
    const key = keys[n];
    const value = newState[key];
    finalState[key] =
      typeof value !== "object" || Array.isArray(value)
        ? value
        : {...state[key], ...value};
  }

  return finalState;
}

function vbStateReducer(state = initialState(), action) {
  let newState;

  switch (action.type) {
    case "FETCH_INIT": {
      newState = mergeStates(state, action.state);
      newState.charts = [];
      newState.datagroups = [];
      newState.load = {
        inProgress: true,
        total: action.total,
        done: 0,
        error: undefined
      };
      return newState;
    }

    case "FETCH_PROGRESS": {
      return {
        ...state,
        load: {
          ...state.load,
          done: state.load.done + 1
        }
      };
    }

    case "FETCH_FINISH": {
      newState = mergeStates(state, action.state);
      newState.load = {
        total: 0,
        done: 0,
        error: null,
        inProgress: false,
        lastUpdate: Math.random()
      };
      return newState;
    }

    case "FETCH_ERROR": {
      newState = action.state;
      newState.load = {
        total: 0,
        done: 0,
        error: action.error,
        inProgress: false,
        lastUpdate: Math.random()
      };
      return newState;
    }

    case "STATE_UPDATE": {
      return mergeStates(state, action.state);
    }

    default: {
      return state;
    }
  }
}

export default vbStateReducer;
