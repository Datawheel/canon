import {BLOCK_TYPES} from "../../../../utils/consts/cms";

import selectorAdapter from "./Selector";

/**
 * @callback BlockAdapterFunction
 * A type of function to be implemented if a certain
 * Block type needs to be rendered a specfic way when being previewed.
 *
 * @param {Object} variables - an object of the materialized variables for a block that is the output of 
 * @param {string} id - block ID of the block being adapted
 * its evaluated logic content
 * @returns {Object} returns an object which serves as the props for a Block's renderer component
 */

export default {
  [BLOCK_TYPES.SELECTOR]: selectorAdapter
};
