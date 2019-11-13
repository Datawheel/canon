import {doubleFinder, findByLevelLike} from "../helpers/find";
import {structGroup} from "../helpers/structs";
import {selectDefaultGroups} from "../store/instance/selectors";
import {doQueryInyect} from "../store/query/actions";
import {selectLevelListForCube, selectMeasureListForCube} from "../store/query/selectors";
import {CORE_VALIDATE_PARAMS} from "./actions";

export default {
  /**
   * Checks groups and filters to remove items not related to the cube set at
   * runtime. If no groups pass the filter, a default group is generated from
   * the user config.
   * This action must be performed after every measure update.
   *
   * @param {import("../types").MiddlewareActionParams<any>} param0
   */
  [CORE_VALIDATE_PARAMS]: ({dispatch, getState}) => {
    const state = getState();
    const queryState = state.vizbuilder.query;

    const levels = selectLevelListForCube(state);
    const measures = selectMeasureListForCube(state);

    const partialQuery = {groups: {}, filters: {}};

    Object.keys(queryState.groups).forEach(key => {
      const group = queryState.groups[key];
      if (levels.some(lvl => lvl.hash === group.hash)) {
        // Let's hope the member list is the same
        partialQuery.groups[key] = group;
      }
    });

    Object.keys(queryState.filters).forEach(key => {
      const filter = queryState.filters[key];
      if (measures.some(measure => measure.name === filter.measure)) {
        partialQuery.filters[key] = filter;
      }
    });

    if (Object.keys(partialQuery.groups).length === 0) {
      const defaultGroup = selectDefaultGroups(state);
      const drillable = defaultGroup
        ? doubleFinder(findByLevelLike, defaultGroup, levels, true)
        : levels[0];
      const group = structGroup(drillable);
      partialQuery.groups[group.key] = group;
    }

    dispatch(doQueryInyect(partialQuery));
  }
};
