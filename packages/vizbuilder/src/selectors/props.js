import {createSelector} from "reselect";
import {ensureArray} from "../helpers/arrays";
import {selectInstanceParams} from "./state";

export const selectTopojsonProp = createSelector(
  selectInstanceParams,
  instance => instance.topojson || {}
);

export const selectDefaultMeasureProp = createSelector(
  selectInstanceParams,
  instance => instance.defaultMeasure || ""
);

export const selectDefaultGroupsProp = createSelector(selectInstanceParams, instance =>
  ensureArray(instance.defaultGroup)
);

/**
 * @param {VizbuilderState} state
 */
export const selectGeomapLevels = createSelector(selectTopojsonProp, topojson =>
  Object.keys(topojson)
);

export const selectIsGeomapMode = createSelector(
  selectGeomapLevels,
  levelNames => levelNames.length === 1 && levelNames[0] === "geomap"
);
