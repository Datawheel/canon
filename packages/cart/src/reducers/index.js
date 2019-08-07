import initialState from "../state";

import {CLEAR_CART, ADD_TO_CART, REMOVE_FROM_CART} from "../actions";

/**
 * Cart reducer
 *
 */
function cartStateReducer(state = initialState(), action) {
  let newState;

  switch (action.type) {

    case CLEAR_CART: {
      newState = initialState();
      return newState;
    }

    case ADD_TO_CART: {
      return {
        ...state,
        list: {
          ...state.list,
          [action.payload.id]: action.payload
        }
      };
    }

    case REMOVE_FROM_CART: {
      newState = state.list;
      newState = Object.assign({}, state.list);
      delete newState[action.payload.id];
      return {
        ...state,
        list: newState
      };
    }

    default: {
      return state;
    }
  }
}

export default cartStateReducer;
