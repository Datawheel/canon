import {doubleFinder, findByLevelLike} from "../helpers/find";
import {structGroup} from "../helpers/structs";
import {selectLevelListByCube, selectMeasureListByCube} from "../selectors/listsDerived";
import {selectDefaultGroups} from "../selectors/props";
import {doQueryInyect} from "../store/query/actions";
import {CORE_VALIDATE_PARAMS} from "./actions";

export default {
  /**
   * Checks groups and filters to remove items not related to the cube set at
   * runtime. If no groups pass the filter, a default group is generated from
   * the user config.
   * This action must be performed after every measure update.
   *
   * @param {import("..").MiddlewareActionParams<any>} param0
   */
  [CORE_VALIDATE_PARAMS]: ({dispatch, getState}) => {
    const state = getState();
    const queryState = state.vizbuilder.query;

    const levels = selectLevelListByCube(state);
    const measures = selectMeasureListByCube(state);

    const partialQuery = {
      groups: queryState.groups.filter(group =>
        levels.some(
          level =>
            level.dimension === group.dimension &&
            level.hierarchy === group.hierarchy &&
            level.name === group.level
        )
      ),
      filters: queryState.filters.filter(({measure: measureName}) =>
        measures.some(measure => measure.name === measureName)
      )
    };

    if (partialQuery.groups.length === 0) {
      const defaultGroup = selectDefaultGroups(state);
      const drillable = doubleFinder(findByLevelLike, defaultGroup, levels, true);
      const group = structGroup(drillable);
      partialQuery.groups.push(group);
    }

    dispatch(doQueryInyect(partialQuery));
  }
};
