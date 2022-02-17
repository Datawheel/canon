import {BLOCK_TYPES} from "../../../utils/consts/cms";

import adapters from "./previewAdapters";
import editors from "./simpleEditors";
import renderers from "./renderers";

/**
 * @typedef BlockConfig
 * Config object that determines a block's behavior when it is being rendered and edited
 * @property {string} type - a unique identifier for this block type 
 * @property {} renderer - component that will render the visual element of a block
 * @property {} [adapter] - transform function to turn the output of a block's logic to the renderer's required props
 * @property {} [editor] - component used to provide a user-friendly way to create and edit a block and its logic
 * @property {boolean} [renderPreviewOnEdit=true] - flag that says whether a block should be updated everytime it is updated in the CMS
 * @property {number} [debounceEditInMs=500] - time in milliseconds that edits to the block's content should be debounced
 */

/** @type {{[blockType: string]: BlockConfig}} */
const allBlocks = {

  [BLOCK_TYPES.GENERATOR]: {
    type: BLOCK_TYPES.GENERATOR,
    renderer: renderers[BLOCK_TYPES.GENERATOR],
    adapter: adapters[BLOCK_TYPES.GENERATOR],
    renderPreviewOnEdit: false
  },

  [BLOCK_TYPES.IMAGE]: {
    type: BLOCK_TYPES.IMAGE,
    renderer: renderers[BLOCK_TYPES.IMAGE],
    renderPreviewOnEdit: false
  },

  [BLOCK_TYPES.PARAGRAPH]: {
    type: BLOCK_TYPES.PARAGRAPH,
    renderer: renderers[BLOCK_TYPES.PARAGRAPH],
    renderPreviewOnEdit: true
  },

  [BLOCK_TYPES.SELECTOR]: {
    type: BLOCK_TYPES.SELECTOR,
    renderer: renderers[BLOCK_TYPES.SELECTOR],
    adapter: adapters[BLOCK_TYPES.SELECTOR],
    editor: editors[BLOCK_TYPES.SELECTOR],
    renderPreviewOnEdit: false
  },

  [BLOCK_TYPES.STAT]: {
    type: BLOCK_TYPES.STAT,
    renderer: renderers[BLOCK_TYPES.STAT],
    renderPreviewOnEdit: true
  },

  [BLOCK_TYPES.SUBTITLE]: {
    type: BLOCK_TYPES.SUBTITLE,
    renderer: renderers[BLOCK_TYPES.SUBTITLE],
    renderPreviewOnEdit: true
  },

  [BLOCK_TYPES.TITLE]: {
    type: BLOCK_TYPES.TITLE,
    renderer: renderers[BLOCK_TYPES.TITLE],
    renderPreviewOnEdit: true
  },

  [BLOCK_TYPES.VIZ]: {
    type: BLOCK_TYPES.VIZ,
    renderer: renderers[BLOCK_TYPES.VIZ],
    adapter: adapters[BLOCK_TYPES.VIZ],
    renderPreviewOnEdit: false
  }
};

export default allBlocks;

export {adapters, editors, renderers};
