import {getHashCode, getHumanTitle} from "../helpers/transformations";

/* Clear Cart */
export const CLEAR_CART = "@@canon-cart/CLEAR_CART";
export const clearCartAction = () => ({
  type: CLEAR_CART
});

/* Clear query to Cart */
export const ADD_TO_CART = "@@canon-cart/ADD_TO_CART";
export const addToCartAction = query => {
  const id = getHashCode(query);
  const name = getHumanTitle(query);
  return {
    type: ADD_TO_CART,
    payload: {id, name, query}
  };
};

/* Clear query to Cart */
export const REMOVE_FROM_CART = "@@canon-cart/REMOVE_FROM_CART";
export const removeFromCartAction = id => ({
  type: REMOVE_FROM_CART,
  payload: {id}
});


