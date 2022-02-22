import {BLOCK_TYPES} from "../../../../utils/consts/cms";

import generatorAdapter from "./Generator";
import selectorAdapter from "./Selector";

/**
 * @callback BlockAdapterFunction
 * A type of function to be implemented if a certain
 * Block type needs to be rendered a specfic way when being previewed.
 *
 * @param {Object} variables - an object of the materialized variables for a block that is the output of 
 * its evaluated logic content
 * @returns {Object} returns an object which serves as the props for a Block's renderer component
 */

export default {
  [BLOCK_TYPES.GENERATOR]: generatorAdapter,
  [BLOCK_TYPES.SELECTOR]: selectorAdapter
};
