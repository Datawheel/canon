import {BLOCK_LOGIC_TYPES, BLOCK_EXECUTE_TYPES} from "../../utils/consts/cms";

export const blockHasLocaleContent = blockType => !Object.values(BLOCK_LOGIC_TYPES).includes(blockType);

export const getBlockContent = (block, locale) =>
  !block
    ? {}
    : blockHasLocaleContent(block.type)
      ? block.contentByLocale[locale]?.content
      : block?.content;

export const onlyRenderOnExecute = blockType => BLOCK_EXECUTE_TYPES.includes(blockType);
