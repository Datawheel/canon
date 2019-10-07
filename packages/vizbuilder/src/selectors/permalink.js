import {createSelector} from "reselect";
import {stringifyPermalink} from "../helpers/permalink";
import {selectInstanceParams, selectQueryState} from "./state";

export const selectPermalinkKeywordsProp = createSelector(
  selectInstanceParams,
  instance => ({
    enlarged: instance.permalinkKeys.enlarged || "enlarged",
    filters: instance.permalinkKeys.filters || "filters",
    groups: instance.permalinkKeys.groups || "groups",
    measure: instance.permalinkKeys.measure || "measure"
  })
);

export const selectPermalink = createSelector(
  [selectPermalinkKeywordsProp, selectQueryState],
  stringifyPermalink
);
