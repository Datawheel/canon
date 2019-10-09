import {createSelector} from "reselect";
import {selectInstanceParams} from "./state";
import {ensureArray} from "../helpers/arrays";

/** */
export const selectGeomapLevels = createSelector(selectInstanceParams, instance =>
  Object.keys(instance.topojson || {})
);

/** */
export const selectIsGeomapMode = createSelector(
  selectGeomapLevels,
  levelNames => levelNames.length === 1 && levelNames[0] === "geomap"
);

/** */
export const selectDefaultGroups = createSelector(selectInstanceParams, instance =>
  ensureArray(instance.defaultGroup)
);
