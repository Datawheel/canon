/* react */
import React, {useMemo} from "react";

/* utils */
import d3plusPropify from "../../../utils/d3plusPropify";
import toKebabCase from "../../../utils/formatters/toKebabCase";
import varSwapRecursive from "../../../utils/variables/varSwapRecursive";

/* vizes */
import * as d3plus from "d3plus-react";
import Graphic from "../../reportVizes/Graphic";
import HTML from "../../reportVizes/HTML";
import Table from "../../reportVizes/Table";
import Options from "../../reportVizes/Options";

import defaultConfig from "../../../utils/viz/defaultConfig";

/* context */
import useAppContext from "../../hooks/context/useAppContext";

// User must define custom sections in app/reports/sections, and export them from an index.js in that folder.
import * as CustomVizzes from "CustomVizzes";

const vizTypes = {Table, Graphic, HTML, ...d3plus, ...CustomVizzes};

// A stub viz, shown when the config is inactive or broken
const stub = message => ({
  data: [],
  dataFormat: d => d,
  type: "Treemap",
  noDataHTML: `<p style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;"><strong>${message}</strong></p>`
});

/**
 * Viz Renderer
*/
export default function Viz({block, blockState, active, locale, variables, debug, configOverride = {}}) {

  const context = useAppContext();

  // todo1.0 - There is a ton of missing functionality here. updateSources, getChildContext, various context interactions.
  // This will all need to be brought in, to play nice with legacy context.

  const vizProps = useMemo(() => {
    if (!active) return {config: stub("Activate to View")};
    if (!block.content.logic) return {config: stub("Add a Configuration")};
    // todo1.0 fix all these arguments!
    const transpiledLogic = varSwapRecursive({logic: block.content.logic}, {}, variables, {}).logic;
    return d3plusPropify(transpiledLogic, {}, variables, locale, block.id, {});
  }, [block, active]);

  // If the result of propify has an "error" property, then the provided javascript was malformed and propify
  // caught an error. Instead of attempting to render the viz, simply show the error to the user.
  // If "debug" is set to true, this viz is being rendered in the CMS, and we can show the stacktrace directly.
  if (vizProps.error && debug) return <div>{`Error in Viz index: ${vizProps.error}`}</div>;
  // Note that if vizProps.error exists but debug is NOT true, we should still keep rendering, because propify
  // gave us a "stub" config with a user-friendly error message built in, so the front-end can see it.
  vizProps.config = {...vizProps.config, ...configOverride};

  // todo1.0 this should not happen every time, but only in the cms.
  const re = new RegExp(/height\:[\s]*([0-9]+)/g);
  let height = re.exec(vizProps.config);
  height = height ? height[1] : "400";
  vizProps.config.height = height;

  // strip out the "type" from config
  const {type} = vizProps.config;
  // delete vizProps.config.type;
  if (!type) return null;
  const Visualization = vizTypes[type];
  if (!Visualization) {
    return <div>{`${type} is not a valid Visualization Type`}</div>;
  }

  const title = vizProps.config.title;

  const vizConfig = {locale, ...vizProps.config};

  // todo1.0 this probably doesn't work as print is added to context later, come back for this
  if (context.print) vizConfig.detectVisible = false;
  // whether to show the title and/or visualization options
  const showHeader = !context.print && type !== "Graphic" && type !== "HTML";

  // todo1.0 this is temporary, to get the buttons out of the way
  const showOptions = false;

  return <div
  // todo1.0 this ref needs to be updated
  // ref={ comp => this.viz = comp }
  >
    {showHeader &&
      <div>
        {showOptions && !vizProps.error
          ? <Options
            key="option-key"
            // todo1.0 fix this screenshot service here
            // component={{section, viz: this}}
            dataAttachments={vizConfig.dataAttachments}
            data={vizConfig.data}
            dataFormat={vizProps.dataFormat}
            // todo1.0 sections no longer have direct slugs and titles, so these will need to come
            // from somewhere else
            // slug={slug}
            // title={title || sectionTitle || slug}
            title={title}
          /> : ""
        }
      </div>
    }
    <div>
      <Visualization
        key="viz-key"
        dataFormat={resp => {
          const hasMultiples = vizProps.data && Array.isArray(vizProps.data) && vizProps.data.length > 1 && vizProps.data.some(d => typeof d === "string");
          const sources = hasMultiples ? resp : [resp];
          // sources.forEach(r => this.analyzeData.bind(this)(r));
          let data;
          try {
            data = vizProps.dataFormat(resp);
          }
          catch (e) {
            console.log("Error in dataFormat: ", e);
            data = [];
          }
          return data;
        }}
        linksFormat={vizProps.linksFormat}
        nodesFormat={vizProps.nodesFormat}
        topojsonFormat={vizProps.topojsonFormat}
        config={{...vizConfig, variables}}
      />
    </div>
  </div>;
}

