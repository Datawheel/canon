import {useSelector} from "react-redux";

export const useBlocks = () => useSelector(state => state.cms.reports.entities.blocks);

export const useBlock = blockId => useBlocks()?.[blockId];

export const useRawFormatters = () => useSelector(state => state.cms.formatters);

export const useFormatters = locale => useSelector(state => state.cms.resources.formatterFunctions[locale || state.cms.status.localeDefault]);
