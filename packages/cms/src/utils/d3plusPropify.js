import {dataConcat} from "d3plus-viz";
import {parse} from "./FUNC";

const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

const frontEndMessage = "Error Rendering Visualization";
const errorStub = {
  data: [],
  dataFormat: d => d,
  type: "Treemap",
  noDataHTML: `<p style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;"><strong>${frontEndMessage}</strong></p>`
};

export default (logic, formatters = {}, variables = {}, locale = envLoc, id = null, actions = {}) => {

  let config;

  // The logic provided might be malformed. Wrap it in a try/catch to be sure we don't
  // crash / RSOD whatever page is making use of propify.
  try {
    config = parse({vars: ["variables"], logic}, formatters, locale, actions)(variables);
  }
  // If the javascript fails, return a special error object for the front-end to use.
  catch (e) {
    console.error(`Parsing Error in propify (ID: ${id})`);
    console.error(`Error message: ${e.message}`);
    return {
      error: `${e}`,
      config: errorStub
    };
  }
  // If the user added correct javascript, but it doesn't return an object, don't attempt to render.
  if (typeof config !== "object") {
    return {
      error: "Visualization JS code must return an object",
      config: errorStub
    };
  }

  // strip out the "dataFormat" from config
  const dataFormat = config.dataFormat ? config.dataFormat : resp => {
    const hasMultiples = Array.isArray(config.data) && config.data.length > 1 && config.data.some(d => typeof d === "string");
    const sources = hasMultiples ? resp : [resp];
    return dataConcat(sources, "data");
  };
  delete config.dataFormat;

  const linksFormat = config.linksFormat || undefined;
  delete config.linksFormat;

  const nodesFormat = config.nodesFormat || undefined;
  delete config.nodesFormat;

  const topojsonFormat = config.topojsonFormat || undefined;
  delete config.topojsonFormat;

  return {config, dataFormat, linksFormat, nodesFormat, topojsonFormat};

};
