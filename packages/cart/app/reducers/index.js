import exampleReducer from "./example";
import {cartStateReducer} from "../../src/index";

/**
  The object exported by this file should contain reducers to be
  combined with the internal default canon reducers.
*/

export default {
  example: exampleReducer,
  cart: cartStateReducer
};
