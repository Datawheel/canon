import {useMemo} from "react";
import {useSelector} from "react-redux";

const useVariables = id => {
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];
  const currentReport = useSelector(state => state.cms.status.currentReport);
  const {attributes} = useSelector(state => state.cms.reports.entities.reports[currentReport]);
  const variables = useMemo(() => {
    console.log("variable Update");
    return block ? Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), attributes) : {};
  }, [blocks, block]);
  return variables;
};

export {useVariables};
