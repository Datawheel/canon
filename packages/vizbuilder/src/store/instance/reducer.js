import {INSTANCE_UPDATE} from "./actions";

/** @type {InstanceState} */
export const instanceInitialState = {
  datacap: 20000,
  key: "vizbuilder",
  multipliers: {},
  permalink: true,
  permalinkEnlarged: "enlarged",
  permalinkFilters: "filters",
  permalinkGroups: "groups",
  permalinkMeasure: "measure",
  topojson: [],
  visualizations: ["barchart", "barchartyear", "geomap", "lineplot", "stacked", "treemap"]
};

export const instanceReducer = (state = instanceInitialState, {type, payload}) =>
  type === INSTANCE_UPDATE
    ? {
        ...state,
        topojson: payload.topojson,
        permalink: payload.permalink,
        permalinkEnlarged: payload.permalinkEnlarged,
        permalinkFilters: payload.permalinkFilters,
        permalinkGroups: payload.permalinkGroups,
        permalinkMeasure: payload.permalinkMeasure,
        defaultMeasure: payload.defaultMeasure,
        defaultGroup: payload.defaultGroup,
        multipliers: payload.multipliers,
        datacap: payload.datacap,
        visualizations: payload.visualizations,
        key: payload.key
      }
    : state;
