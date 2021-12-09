import React, {useMemo} from "react";

import d3plusPropify from "../../utils/d3plusPropify";

import toKebabCase from "../../utils/formatters/toKebabCase";

import * as d3plus from "d3plus-react";

const vizTypes = d3plus; // todo1.0 add in customviz spread

/**
 * "viz" block renderer
*/
export default function Viz({config}) {

  const vizProps = useMemo(() => {
    console.log("propify");
    // todo1.0 fix all these arguments
    return d3plusPropify(config.logic, {}, {}, "en", 1, {});
  }, [config]);

  const namespace = "reports";
  const locale = "en";

  // strip out the "type" from config
  const {type} = vizProps.config;
  delete vizProps.config.type;
  if (!type) return null;
  const Visualization = vizTypes[type];
  if (!Visualization) {
    return <div>{`${type} is not a valid Visualization Type`}</div>;
  }

  const vizConfig = Object.assign({}, {locale}, vizProps.config);

  return (
    <Visualization
      key="viz-key"
      className={`d3plus ${namespace}-viz ${namespace}-${toKebabCase(type)}-viz`}
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
      config={{...vizConfig}}
    />
  );
}
