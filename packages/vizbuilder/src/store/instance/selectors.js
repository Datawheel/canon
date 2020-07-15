import {createSelector} from "reselect";

/** @type {(state: GeneralState) => InstanceState} */
export const selectInstanceParams = state => state.vizbuilder.instance;

/** */
export const selectGeomapLevels = createSelector(
  selectInstanceParams,
  instance => instance.topojson
);

/** */
export const selectIsGeomapMode = createSelector(
  selectInstanceParams,
  ({visualizations}) => visualizations.length === 1 && visualizations[0] === "geomap"
);

/** */
export const selectDefaultGroups = createSelector(
  selectInstanceParams,
  instance => instance.defaultGroup
);

/** */
export const selectLocale = createSelector(
  selectInstanceParams,
  instance => instance.locale
);
