import initialState from "../state";
import localforage from "localforage";
import {INIT_CART, CLEAR_CART, ADD_TO_CART, REMOVE_FROM_CART, TOGGLE_CART_SETTING, LOAD_DATASETS, SUCCESS_LOAD_DATASET} from "../actions";
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

/**
 * Cart reducer
 *
 */
function cartStateReducer(state = initialState(), action) {
  let newState, tempObj;

  switch (action.type) {

    case INIT_CART: {
      newState = initialState();

      newState = Object.assign(
        initialState(),
        action.payload ? {
          list: action.payload.list,
          settings: action.payload.settings
        } : {}
      );
      newState.internal.ready = true;
      newState.internal.loading = newState.list && Object.keys(newState.list).length > 0 ? true : false;
      return newState;
    }

    case CLEAR_CART: {
      newState = initialState();
      newState.internal.full = false;
      newState.internal.ready = true;
      newState.internal.loading = false;
      setLocalForageState(newState);
      return newState;
    }

    case ADD_TO_CART: {
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.id}`]: action.payload
        }
      };
      newState.internal.full = Object.keys(newState.list).length === MAX_DATASETS_IN_CART ? true : false;
      newState.internal.loading = true;
      setLocalForageState(newState);
      return newState;
    }

    case REMOVE_FROM_CART: {
      newState = Object.assign({}, state.list);
      delete newState[action.payload.id];
      newState = {
        ...state,
        list: newState
      };
      newState.internal.full = Object.keys(newState.list).length === MAX_DATASETS_IN_CART ? true : false;
      newState.internal.loading = true;
      setLocalForageState(newState);
      return newState;
    }

    case TOGGLE_CART_SETTING: {
      newState = Object.assign({}, state.settings);
      newState[action.payload.id].value = !newState[action.payload.id].value;
      newState = {
        ...state,
        settings: newState
      };
      newState.internal.loading = true;
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
        list: tempObj
      };
      const arr = [];
      Object.keys(newState.list).map(id => {
        arr.push(id);
      });
      newState.loadingList = arr;
      newState.internal.loading = true;
      return newState;
    }

    case SUCCESS_LOAD_DATASET: {
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.id}`]: {
            ...state.list[`${action.payload.id}`],
            isLoaded: true
          }
        }
      };
      newState.loadingList.pop();
      newState.internal.loading = !allDatasetsLoaded(newState.list);
      return newState;
    }

    default: {
      return state;
    }
  }
}

export default cartStateReducer;
