/* eslint-disable react/no-this-in-sfc */
/* eslint-disable no-underscore-dangle */
/*
  TODO
   - [ ] port HTML/Table viz types
   - [ ] allow CustomVizzes
*/

import React, {useContext, useEffect, useRef} from "react";
import {useRouter} from "next/router.js";

import {Title} from "@mantine/core";
import {useViewportSize} from "@mantine/hooks";
import * as d3plus from "d3plus-react";
import {colorAssign} from "d3plus-color";
import Options from "./Options";
import ProfileContext from "../ProfileContext";
import propify from "../../utils/d3plusPropify";
import HTML from "./HTML";
// User must define custom sections in app/cms/sections, and export them from an index.js in that folder.
// import * as CustomVizzes from "CustomVizzes";
import Graphic from "./Graphic";
// import HTML from "./HTML";
import Table from "./Table";
// const vizTypes = {Table, Graphic, HTML, ...d3plus, ...CustomVizzes};

const vizTypes = {
  HTML, Table, Graphic, ...d3plus,
};

/**
 *
 * @param {*} props
 * @returns
 */
function Viz(props) {
  const {
    className = "",
    config = {},
    configOverride = {},
    debug,
    headingLevel = "h3",
    hideOptions,
    namespace = "cp",
    section,
    sectionTitle,
    showTitle = true,
    slug,
    updateSource,
  } = props;

  const vizRef = useRef(null);
  const context = useContext(ProfileContext);
  const {
    comparison, compVariables, formatters, onOpenModal = (d) => d, print, variables, profileId,
  } = context;
  const {toKebabCase = (d) => d} = formatters || {};

  const {width} = useViewportSize();
  const {locale} = useRouter();

  const analyzeData = (resp) => {
    if (updateSource) {
      if (resp.source) {
        updateSource(resp.source);
      } else if (Array.isArray(resp)) {
        updateSource(resp.reduce((acc, d) => (d.source && Array.isArray(d.source) ? acc.concat(d.source) : acc), []));
      }
    }
  };

  const isComparison = comparison && compVariables.id === variables.id;
  // onSetVariables will either come from ProfileBuilder (CMS) or Profile (Front-end)
  // But either way, it is delivered via context. Have a backup no-op just in case.
  let onSetVariables = (d) => d;
  // eslint-disable-next-line react/destructuring-assignment
  if (props.onSetVariables) {
    if (isComparison) {
      // eslint-disable-next-line react/destructuring-assignment
      onSetVariables = (variables, forceMats) => props.onSetVariables(variables, forceMats, true);
    } else {
      // eslint-disable-next-line react/destructuring-assignment
      onSetVariables = props.onSetVariables;
    }
  }

  const {id} = config;

  // clone config object to allow manipulation
  const actions = {onSetVariables, onOpenModal};

  const vizProps = propify(
    config.logic,
    formatters,
    config.comparison
      ? compVariables : variables,

    locale,

    id,

    actions,
  );

  // If the result of propify has an "error" property, then the provided javascript was malformed and propify
  // caught an error. Instead of attempting to render the viz, simply show the error to the user.
  // If "debug" is set to true, this viz is being rendered in the CMS, and we can show the stacktrace directly.
  if (vizProps.error && debug) return <div>{`Error in Viz index: ${vizProps.error}`}</div>;
  // Note that if vizProps.error exists but debug is NOT true, we should still keep rendering, because propify
  // gave us a "stub" config with a user-friendly error message built in, so the front-end can see it.
  vizProps.config = Object.assign(vizProps.config, configOverride);

  if (debug) vizProps.config.duration = 0;

  // strip out the "type" from config
  const {type} = vizProps.config;
  delete vizProps.config.type;

  if (!type) return null;
  const Visualization = vizTypes[type];
  if (!Visualization) {
    return <div>{`${type} is not a valid Visualization Type`}</div>;
  }

  const {title} = vizProps.config;
  delete vizProps.config.title;

  const vizConfig = {locale, ...vizProps.config};

  if (print) vizConfig.detectVisible = false;
  useEffect(() => {
    if (vizConfig.forceUpdate) {
      // eslint-disable-next-line max-len
      console.log(`%cWarning: Detected viz config id: ${id} is using forceUpdate. This is not-recommended, instead pass the variables your viz needs to watch directly through the config object.`, "color: yellow");
    }
  }, []);

  // whether to show the title and/or visualization options
  const showHeader = ((title && showTitle) || (!hideOptions && !print)) && type !== "Graphic" && type !== "HTML";
  return (
    <div
      className={`${namespace}-viz-container${
        className ? ` ${className}` : ""
      }${
        type ? ` ${namespace}-${toKebabCase(type)}-viz-container` : ""
      }`}
      ref={vizRef}
    >
      {showHeader

        && (
        <div className={`${namespace}-viz-header`}>
          {title && showTitle
            ? (
              <Title
                align="center"
                order={parseInt(headingLevel.replace("h", ""), 10)}
                size="h5"
                className={`${namespace}-viz-title u-margin-top-off u-margin-bottom-off u-font-xs`}
                dangerouslySetInnerHTML={{__html: title}}
              />
            )

            : null}
          {!hideOptions && !vizProps.error
            ? (
              <Options
                key="option-key"
                component={{section, viz: vizRef}}
                dataAttachments={vizConfig.dataAttachments}
                data={vizConfig.viewData || vizConfig.data}
                dataFormat={vizConfig.viewDataFormat || vizProps.dataFormat}
                slug={slug}
                title={title || sectionTitle || slug}
                iconOnly={width < 320}
              />
            )
            : null}
        </div>
        )}
      <div
        className={`${namespace}-viz-figure${vizConfig.height || type === "Graphic"
          ? " with-explicit-height" : ""}`}
        style={{minHeight: 400}}
      >
        <Visualization
          key={`${profileId}-${id}`}
          className={`d3plus ${namespace}-viz ${namespace}-${toKebabCase(type)}-viz`}
          dataFormat={(resp) => {
            const hasMultiples = vizProps.data
              && Array.isArray(vizProps.data)
              && vizProps.data.length > 1 && vizProps.data.some((d) => typeof d === "string");
            const sources = hasMultiples ? resp : [resp];
            sources.forEach(analyzeData);
            let data;
            try {
              data = vizProps.dataFormat(resp);
            } catch (e) {
              console.log("Error in dataFormat: ", e);
              data = [];
            }
            return data;
          }}
          linksFormat={vizProps.linksFormat}
          nodesFormat={vizProps.nodesFormat}
          topojsonFormat={vizProps.topojsonFormat}
          config={{
            ...vizProps.config,
            variables,
            // overrides
            forceUpdate: false,
            shapeConfig: {
              ...(vizProps.config?.shapeConfig || {}),
              stroke: undefined,
              Path: {
                ...(vizProps.config?.shapeConfig?.Path || {}),
                // fill: () => "white",
              },
              Line: {
                ...(vizProps.config?.shapeConfig?.Line || {}),
                stroke(d, i) {
                  if (this._colorScale) {
                    const c = this._colorScale(d, i);
                    if (c !== undefined && c !== null) {
                      const scale = this._colorScaleClass._colorScale;
                      const colors = this._colorScaleClass.color();
                      if (!scale) return colors instanceof Array ? colors[colors.length - 1] : colors;
                      if (!scale.domain().length) return scale.range()[scale.range().length - 1];
                      return scale(c);
                    }
                  }
                  const c = this._color(d, i);
                  return colorAssign(c);
                },
                labelConfig: {
                  ...(vizProps.config?.shapeConfig?.Line?.labelConfig || {}),
                  fontColor(d, i) {
                    if (this._colorScale) {
                      const c = this._colorScale(d, i);
                      if (c !== undefined && c !== null) {
                        const scale = this._colorScaleClass._colorScale;
                        const colors = this._colorScaleClass.color();
                        if (!scale) return colors instanceof Array ? colors[colors.length - 1] : colors;
                        if (!scale.domain().length) return scale.range()[scale.range().length - 1];
                        return scale(c);
                      }
                    }
                    const c = this._color(d, i);
                    return colorAssign(c);
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Viz;
