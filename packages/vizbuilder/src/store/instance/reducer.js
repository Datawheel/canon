import {INSTANCE_UPDATE} from "./actions";

/** @type {InstanceState} */
export const instanceInitialState = {
  datacap: 20000,
  key: "vizbuilder",
  locale: "en",
  multipliers: {},
  permalink: true,
  permalinkConfint: "ci",
  permalinkEnlarged: "enlarged",
  permalinkFilters: "filters",
  permalinkGroups: "groups",
  permalinkMeasure: "measure",
  permalinkPeriod: "time",
  topojson: [],
  visualizations: ["barchart", "barchartyear", "geomap", "lineplot", "stacked", "treemap"]
};

/** @type {import("redux").Reducer<InstanceState>} */
export const instanceReducer = (state = instanceInitialState, {type, payload}) =>
  type === INSTANCE_UPDATE
    ? {
      ...state,
      datacap: payload.datacap || instanceInitialState.datacap,
      defaultGroup: payload.defaultGroup,
      defaultMeasure: payload.defaultMeasure,
      key: payload.key || instanceInitialState.key,
      locale: payload.locale || instanceInitialState.locale,
      multipliers: payload.multipliers || instanceInitialState.multipliers,
      permalink:
          typeof payload.permalink === "boolean"
            ? payload.permalink
            : instanceInitialState.permalink,
      permalinkConfint:
          payload.permalinkConfint || instanceInitialState.permalinkConfint,
      permalinkEnlarged:
          payload.permalinkEnlarged || instanceInitialState.permalinkEnlarged,
      permalinkFilters:
          payload.permalinkFilters || instanceInitialState.permalinkFilters,
      permalinkGroups: payload.permalinkGroups || instanceInitialState.permalinkGroups,
      permalinkMeasure:
          payload.permalinkMeasure || instanceInitialState.permalinkMeasure,
      permalinkPeriod: payload.permalinkPeriod || instanceInitialState.permalinkPeriod,
      topojson: payload.topojson || instanceInitialState.topojson,
      visualizations: payload.visualizations || instanceInitialState.visualizations
    }
    : state;
