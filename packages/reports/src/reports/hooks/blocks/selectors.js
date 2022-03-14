import {useSelector} from "react-redux";
import {getBlockContent} from "../../../utils/blocks/getBlockContent";

export const useBlocks = () => useSelector(state => state.cms.reports.entities.blocks);

export const useBlock = blockId => useSelector(state => state.cms.reports.entities.blocks[blockId]);

export const useBlockContent = (blockId, locale) => useSelector(state => {
  const block = state.cms.reports.entities.blocks[blockId];
  return getBlockContent(block, locale);
});

export const useBlockSimpleState = (blockId, locale) => useBlockContent(blockId, locale)?.simple || {};

export const useBlockLogicState = (blockId, locale) => useBlockContent(blockId, locale)?.logic;

export const useRawFormatters = () => useSelector(state => state.cms.formatters);

export const useFormatters = locale => useSelector(state => state.cms.resources.formatterFunctions[locale || state.cms.status.localeDefault]);
