import {
  getValidDrilldowns,
  joinDrilldownList,
  addTimeDrilldown
} from "../helpers/sorting";

/*
 * These functions are event handlers for multiple components.
 * Treat them as they were defined within the component itself.
 * The `this` element is the active instance of said component.
 */

export function updateLocalContext() {
  this.setState({lastUpdate: Date.now()});
}

export function setMeasure(measure) {
  const {options} = this.props;
  const {queryUpdate, optionsUpdate, loadWrapper} = this.context;

  const cube = options.cubes.find(cube => cube.measures.indexOf(measure) > -1);
  const levels = getValidDrilldowns(cube);
  const drilldowns = addTimeDrilldown(levels.slice(0, 1), cube);

  return loadWrapper(
    () =>
      Promise.all([
        optionsUpdate({levels}),
        queryUpdate({cube, measure, drilldowns})
      ]),
    this.fetchQuery
  );
}

export function setDrilldown(level) {
  const {options, query} = this.props;
  const {queryUpdate} = this.context;

  if (options.levels.indexOf(level) > -1) {
    let drilldowns = joinDrilldownList(query.drilldowns, level);
    drilldowns = addTimeDrilldown(drilldowns, query.cube);
    queryUpdate({drilldowns}).then(this.fetchQuery);
  }
}

export function removeDrilldown(levelName) {
  const {options, query} = this.props;
  const {queryUpdate} = this.context;
  const level = options.levels.find(lvl => lvl.name === levelName);

  if (level && !(/\[date\]/i).test(level.fullName)) {
    queryUpdate({
      drilldowns: query.drilldowns.filter(lvl => lvl !== level)
    }).then(this.fetchQuery);
  }
}
