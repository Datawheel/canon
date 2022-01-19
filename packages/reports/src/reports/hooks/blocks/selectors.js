import {useSelector} from "react-redux";

export const useBlocks = () => useSelector(state => state.cms.reports.entities.blocks);

export const useBlock = blockId => useBlocks()?.[blockId];
