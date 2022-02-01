/* react */
import React, {useMemo} from "react";
import {Badge, Center} from "@mantine/core";

/* utils */
import d3plusPropify from "../../../../utils/d3plusPropify";
import varSwapRecursive from "../../../../utils/variables/varSwapRecursive";
import mortarEval from "../../../../utils/variables/mortarEval";
import defaultConfig from "../../../../utils/viz/defaultConfig";

/* vizes */
import * as d3plus from "d3plus-react";
import Graphic from "../../../reportVizes/Graphic";
import HTML from "../../../reportVizes/HTML";
import Table from "../../../reportVizes/Table";
import Options from "../../../reportVizes/Options";

/* enums */
import {VIZ_SETTINGS} from "../../../../utils/consts/cms";

/* context */
import useAppContext from "../../../hooks/context/useAppContext";

// User must define custom sections in app/reports/sections, and export them from an index.js in that folder.
import * as CustomVizzes from "CustomVizzes";
import {useFormatters} from "../../../hooks/blocks/selectors";

const vizTypes = {Table, Graphic, HTML, ...d3plus, ...CustomVizzes};

const ErrorMessage = ({message}) => <Center style={{height: "100%"}}><Badge key="type" color="gray" variant="outline">{message}</Badge></Center>;

/**
 * Viz Renderer
*/
export default function Viz({block, active, locale, variables, debug, configOverride = {}}) {

  const context = useAppContext();

  const formatterFunctions = useFormatters(locale);

  // todo1.0 - There is a ton of missing functionality here. updateSources, getChildContext, various context interactions.
  // This will all need to be brought in, to play nice with legacy context.

  const vizProps = useMemo(() => {
    if (!active) return {error: "Activate to View"};
    if (!block?.content?.logic) return {error: "Add a Configuration"};
    // todo1.0 fix all these arguments!
    const transpiledLogic = varSwapRecursive({logic: block.content.logic}, formatterFunctions, variables, {}).logic;
    return d3plusPropify(transpiledLogic, formatterFunctions, variables, locale, block.id, {});
  }, [block, active]);

  // todo1.0 - these vizSettings should be used to implement tabs, mini, options, etc on the front end
  const vizSettings = useMemo(() => {
    if (!active || !block?.content?.[VIZ_SETTINGS.VIZ_SETTINGS_LOGIC]) return {};
    const logic = block.content[VIZ_SETTINGS.VIZ_SETTINGS_LOGIC];
    const {vars} = mortarEval("variables", variables, logic, formatterFunctions, locale);
    return vars;
  }, [block, active]);

  // strip out the "type" from config
  const {type} = vizProps.config || {};
  if (!type) vizProps.config = {error: "Visualization missing \"type\""};
  const Visualization = vizTypes[type];
  if (type && !Visualization) vizProps.config = {error: `"${type}" is not a valid Visualization Type`};

  // If the result of propify has an "error" property, then the provided javascript was malformed and propify
  // caught an error. Instead of attempting to render the viz, simply show the error to the user.
  // If "debug" is set to true, this viz is being rendered in the CMS, and we can show the stacktrace directly.
  if (vizProps.error) return <ErrorMessage message={debug ? vizProps.error : "Visualization Error"} />;

  vizProps.config = {...vizProps.config, ...configOverride};

  const vizConfig = {locale, variables, ...vizProps.config};

  // todo1.0 this probably doesn't work as print is added to context later, come back for this
  if (context.print) vizConfig.detectVisible = false;
  // whether to show the title and/or visualization options
  const showHeader = !context.print && type !== "Graphic" && type !== "HTML";

  // todo1.0 this is temporary, to get the buttons out of the way
  const showOptions = false;

  return <div
    style={{
      display: "flex",
      flex: "1 1 100%"
    }}
  // todo1.0 this ref needs to be updated
  // ref={ comp => this.viz = comp }
  >
    {showHeader && showOptions
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
        title={vizProps.config.title}
      /> : null
    }
    <Visualization
      style={{flex: 1}}
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
      config={{...defaultConfig, ...vizConfig}}
    />
  </div>;
}

