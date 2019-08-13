import initialState from "../state";
import localforage from "localforage";
import {
  INIT_CART,
  CLEAR_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  TOGGLE_CART_SETTING,
  LOAD_DATASETS,
  SUCCESS_LOAD_DATASET,
  START_PROCESSING_DATASETS,
  END_PROCESSING_DATASETS
} from "../actions";
import {STORAGE_CART_KEY, MAX_DATASETS_IN_CART} from "../helpers/consts";

/** Persist state in Local Storage */
function setLocalForageState(newState) {
  const stateToLocalForage = Object.assign({}, initialState());
  const newInstance = Object.assign({}, newState);

  // Clean custom states
  Object.keys(newInstance.list).map(id => {
    newInstance.list[id].isLoaded = false;
  });
  stateToLocalForage.list = Object.assign({}, newInstance.list);
  stateToLocalForage.settings = Object.assign({}, newInstance.settings);
  localforage.setItem(STORAGE_CART_KEY, stateToLocalForage);
}

/** Are all datasets loaded ? */
function allDatasetsLoaded(list) {
  const ids = Object.keys(list);
  let loaded = 0;
  ids.map(id => {
    loaded += list[id].isLoaded ? 1 : 0;
  });
  return ids.length === loaded;
}

/** Retrieve a list of loading datasets */
function getLoadingIds(list) {
  const ids = Object.keys(list);
  const loading = [];
  ids.map(id => {
    if (!list[id].isLoaded) {
      loading.push(id);
    }
  });
  return loading;
}

/**
 * Cart reducer
 */
function cartStateReducer(state = initialState(), action) {
  let newState, tempObj;

  switch (action.type) {

    case INIT_CART: {
      console.log("init->", action.payload);
      tempObj = initialState();
      newState = Object.assign(
        tempObj,
        action.payload ? {
          list: {
            ...tempObj.list,
            ...action.payload.list
          },
          settings: {
            ...tempObj.settings,
            ...action.payload.settings
          }
        } : {}
      );
      newState.internal.ready = true;
      newState.internal.loading = newState.list && Object.keys(newState.list).length > 0 ? true : false;
      return newState;
    }

    case CLEAR_CART: {
      newState = {
        ...initialState(),
        internal: {
          full: false,
          ready: true,
          loading: false
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case ADD_TO_CART: {
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.id}`]: action.payload
        },
        internal: {
          ...state.internal,
          full: Object.keys(state.list).length === MAX_DATASETS_IN_CART ? true : false,
          loading: true
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case REMOVE_FROM_CART: {
      newState = Object.assign({}, state.list);
      delete newState[action.payload.id];
      newState = {
        ...state,
        list: {
          ...newState
        },
        internal: {
          ...state.internal,
          full: Object.keys(newState).length === MAX_DATASETS_IN_CART ? true : false,
          loading: true
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case TOGGLE_CART_SETTING: {
      tempObj = Object.assign({}, state.settings);
      tempObj[action.payload.id].value = !tempObj[action.payload.id].value;
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...tempObj
        },
        internal: {
          ...state.internal,
          loading: true
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case LOAD_DATASETS: {
      tempObj = Object.assign({}, state.list);
      Object.keys(tempObj).map(id => {
        tempObj[id].isLoaded = false;
        return tempObj[id];
      });
      newState = {
        ...state,
        list: {
          ...state.list,
          ...tempObj
        },
        loadingList: getLoadingIds(tempObj),
        internal: {
          ...state.internal,
          loading: true
        }
      };
      return newState;
    }

    case SUCCESS_LOAD_DATASET: {
      tempObj = {
        ...state.list,
        [`${action.payload.id}`]: {
          ...state.list[`${action.payload.id}`],
          isLoaded: true
        }
      };
      newState = {
        ...state,
        list: {
          ...state.list,
          ...tempObj
        },
        loadingList: getLoadingIds(tempObj),
        internal: {
          ...state.internal,
          processing: allDatasetsLoaded(tempObj)
        }
      };
      return newState;
    }

    case START_PROCESSING_DATASETS: {
      newState = {
        ...state,
        internal: {
          ...state.internal,
          processing: true
        }
      };
      return newState;
    }

    case END_PROCESSING_DATASETS: {
      newState = {
        ...state,
        internal: {
          ...state.internal,
          processing: false,
          loading: false
        }
      };
      return newState;
    }

    default: {
      return state;
    }
  }
}

export default cartStateReducer;
