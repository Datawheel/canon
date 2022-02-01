import runSelector from "../../../../utils/selectors/runSelector";

/** @type {import(".").BlockPreviewAdapterFunction} */
const selectorPreviewAdapter = ({block, locale, variables, formatterFunctions}) => {
  const payload = {};
  const {config, log, error} = runSelector(block.contentByLocale[locale].content.logic, formatterFunctions, variables, locale);
  payload.content = {id: block.id, config};
  payload.log = log ? log.join("\n") : "";
  payload.error = error;
  return payload;
};

export default selectorPreviewAdapter;
