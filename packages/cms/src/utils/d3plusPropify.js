import {assign} from "d3plus-common";
import {parse} from "./FUNC";

const envLoc = process.env.CANON_LANGUAGE_DEFAULT || "en";

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
    const frontEndMessage = "Error Rendering Visualization";
    return {
      error: `${e}`,
      config: {
        data: [],
        type: "Treemap",
        noDataHTML: `<div style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;"><strong>${frontEndMessage}</strong></div>`}
    };
  }

  // strip out the "dataFormat" from config
  const dataFormat = config.dataFormat ? config.dataFormat : d => d.data;
  delete config.dataFormat;

  const linksFormat = config.linksFormat || undefined;
  delete config.linksFormat;

  const nodesFormat = config.nodesFormat || undefined;
  delete config.nodesFormat;

  const topojsonFormat = config.topojsonFormat || undefined;
  delete config.topojsonFormat;

  // hides the non-discrete axis, if necessary
  const discrete = config.discrete || "x";
  const opposite = discrete === "x" ? "y" : "x";
  config[`${discrete}Config`] = assign({}, config[`${discrete}Config`] || {}, {
    gridConfig: {
      "stroke-width": 0
    },
    tickSize: 0
  });
  config[`${opposite}Config`] = assign({}, config[`${opposite}Config`] || {}, {
    barConfig: {
      "stroke-width": 0
    }
  });

  return {config, dataFormat, linksFormat, nodesFormat, topojsonFormat};

};
