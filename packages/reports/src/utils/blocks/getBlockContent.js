const {BLOCK_LOGIC_TYPES, BLOCK_EXECUTE_TYPES} = require("../../utils/consts/cms");

const blockHasLocaleContent = blockType => !Object.values(BLOCK_LOGIC_TYPES).includes(blockType);

const getBlockContent = (block, locale) =>
  !block
    ? {}
    : blockHasLocaleContent(block.type)
      ? block.contentByLocale[locale] && block.contentByLocale[locale].content
      : block && block.content;

const onlyRenderOnExecute = blockType => BLOCK_EXECUTE_TYPES.includes(blockType);

module.exports = {blockHasLocaleContent, getBlockContent, onlyRenderOnExecute};
