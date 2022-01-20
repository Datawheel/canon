import {BLOCK_TYPES} from "../../../../utils/consts/cms";

import generatorAdapter from "./Generator";
import selectorAdapter from "./Selector";
import vizAdapter from "./Viz";

/**
 * @typedef BlockPreviewContent
 * The data object expected to be returned from a BlockPreviewAdapterFunction that is
 * used to correctly render Blocks.
 *
 * @property {*} content
 * @property {*} error
 * @property {*} log
 * @property {*} duration
 */

/**
 * @typedef BlockPreviewAdapterParams
 * Params given to an adapter function that might be needed to render content correctly.
 *
 * @param {boolean} active - flag to indicate whether the block has been run, or "activated"
 * @param {Object} block - block data from database
 * @param {Object} blockContent - the working block state, only given if block is being currently edited
 * @param {boolean} debug - whether debugging mode is active
 * @param {Object} variables - input variables of Block
 * @param {string} locale - current locale key
 */

/**
 * @callback BlockPreviewAdapterFunction
 * A type of function to be implemented if a certain
 * Block type needs to be rendered a specfic way when being previewed.
 *
 * @param {BlockPreviewAdapterParams}
 * @returns {BlockPreviewContent}
 */

/**
 *
 */
const allAdapters = {
  [BLOCK_TYPES.GENERATOR]: generatorAdapter,
  [BLOCK_TYPES.SELECTOR]: selectorAdapter,
  [BLOCK_TYPES.VIZ]: vizAdapter
};

export default allAdapters;
