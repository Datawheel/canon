import OPERATORS from "../helpers/operators";
import {makeRandomId} from "../helpers/random";
import {
  getMeasureMOE,
  getTimeDrilldown,
  getValidDimensions,
  getValidDrilldowns,
  reduceLevelsFromDimension,
  preventHierarchyIncompatibility
} from "../helpers/sorting";

/*
 * These functions are event handlers for multiple components.
 * Treat them as they were defined within the component itself.
 * The `this` element is the active instance of said component.
 */

export function setMeasure(measure) {
  const {options, query} = this.props;
  const {loadControl} = this.context;

  return loadControl(() => {
    const cubeName = measure.annotations._cb_name;
    const cube = options.cubes.find(cube => cube.name === cubeName);
    const moe = getMeasureMOE(cube, measure);
    const timeDrilldown = getTimeDrilldown(cube);

    const dimensions = getValidDimensions(cube);
    const drilldowns = getValidDrilldowns(dimensions);

    const dimension = dimensions[0];
    const levels = reduceLevelsFromDimension([], dimension);
    const drilldown = levels[0];

    preventHierarchyIncompatibility(drilldowns, drilldown);

    const conditions = query.cube === cube ? query.conditions : [];

    return {
      options: {dimensions, drilldowns, levels},
      query: {cube, measure, moe, dimension, drilldown, timeDrilldown, conditions},
      queryOptions: {
        parents: drilldown.depth > 1
      }
    };
  }, this.fetchQuery);
}

export function setDimension(dimension) {
  const {dimensions} = this.props.options;
  const {loadControl} = this.context;

  return loadControl(() => {
    const levels = reduceLevelsFromDimension([], dimension);
    const drilldown = levels[0];

    const drilldowns = getValidDrilldowns(dimensions);
    preventHierarchyIncompatibility(drilldowns, drilldown);

    return {
      options: {drilldowns, levels},
      query: {dimension, drilldown},
      queryOptions: {
        parents: drilldown.depth > 1
      }
    };
  }, this.fetchQuery);
}

export function setDrilldown(drilldown) {
  const {options} = this.props;
  const {loadControl} = this.context;

  if (options.levels.indexOf(drilldown) > -1) {
    return loadControl(() => {
      const drilldowns = getValidDrilldowns(options.dimensions);
      preventHierarchyIncompatibility(drilldowns, drilldown);

      return {
        options: {drilldowns},
        query: {drilldown},
        queryOptions: {
          parents: drilldown.depth > 1
        }
      };
    }, this.fetchQuery);
  }

  return undefined;
}

export function addCondition() {
  const {conditions} = this.props.query;
  const {stateUpdate} = this.context;

  const newConditions = [].concat(conditions, {
    hash: makeRandomId(),
    operator: OPERATORS.EQUAL,
    property: "",
    type: "cut",
    values: []
  });
  return stateUpdate({query: {conditions: newConditions}});
}

export function updateCondition(condition) {
  const {conditions} = this.props.query;
  const {loadControl} = this.context;

  const index = conditions.findIndex(cond => cond.hash === condition.hash);

  if (index > -1) {
    loadControl(() => {
      const newConditions = conditions.slice();
      newConditions.splice(index, 1, condition);
      return {query: {conditions: newConditions}};
    }, this.fetchQuery);
  }
}

export function removeCondition(condition) {
  const {conditions} = this.props.query;
  const {loadControl} = this.context;

  const newConditions = conditions.filter(cond => cond.hash !== condition.hash);

  if (newConditions.length < conditions.length) {
    loadControl(() => ({query: {conditions: newConditions}}), this.fetchQuery);
  }
}
