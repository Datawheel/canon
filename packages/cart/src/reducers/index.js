import initialState from "../state";
import localforage from "localforage";
import {INIT_CART, CLEAR_CART, ADD_TO_CART, REMOVE_FROM_CART, TOGGLE_CART_SETTING} from "../actions";
import {STORAGE_CART_KEY, MAX_DATASETS_IN_CART} from "../helpers/consts";

/**
 * Cart reducer
 *
 */
function cartStateReducer(state = initialState(), action) {
  let newState;

  switch (action.type) {

    case INIT_CART: {
      newState = Object.assign(initialState(), action.payload);
      newState.internal.ready = true;
      return newState;
    }

    case CLEAR_CART: {
      newState = initialState();
      newState.internal.ready = true;
      localforage.setItem(STORAGE_CART_KEY, newState);
      return newState;
    }

    case ADD_TO_CART: {
      newState = {
        ...state,
        list: {
          ...state.list,
          [action.payload.id]: action.payload
        }
      };
      newState.internal.full = Object.keys(newState.list).length === MAX_DATASETS_IN_CART ? true : false;
      localforage.setItem(STORAGE_CART_KEY, newState);
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
      localforage.setItem(STORAGE_CART_KEY, newState);
      return newState;
    }

    case TOGGLE_CART_SETTING: {
      newState = Object.assign({}, state.settings);
      newState[action.payload.id].value = !newState[action.payload.id].value;
      newState = {
        ...state,
        settings: newState
      };
      localforage.setItem(STORAGE_CART_KEY, newState);
      return newState;
    }

    default: {
      return state;
    }
  }
}

export default cartStateReducer;
