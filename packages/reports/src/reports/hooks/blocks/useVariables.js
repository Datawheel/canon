import {useMemo} from "react";
import {useSelector} from "react-redux";

const useVariables = id => {
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];
  const currentReport = useSelector(state => state.cms.status.currentReport);
  const {attributes} = useSelector(state => state.cms.reports.entities.reports[currentReport]);
  const {variables, variablesById} = useMemo(() => {
    if (!block) return {variables: {}, variablesById: {}};
    const blockValues = Object.values(blocks).filter(d => block.inputs.includes(d.id));
    return {
      variables: blockValues.reduce((acc, d) => ({...acc, ...d._variables}), attributes),
      variablesById: blockValues.reduce((acc, d) => ({...acc, [d.id]: d._variables}), {attributes})
    };
  }, [blocks, block]);
  return {variables, variablesById, attributeKeys: Object.keys(attributes)};
};

export {useVariables};