import {getValidDrilldowns} from "../helpers/sorting";

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

  return loadWrapper(
    () =>
      Promise.all([
        optionsUpdate({levels}),
        queryUpdate({
          cube,
          measure,
          drilldowns: levels.slice(0, 1)
        })
      ]),
    this.fetchQuery
  );
}

export function setDrilldown(level) {
  const {options, query} = this.props;
  const {queryUpdate} = this.context;

  if (options.levels.indexOf(level) > -1) {
    // TODO: make sure there's no repeated hierarchies
    queryUpdate({
      drilldowns: [].concat(query.drilldowns, level)
    }).then(this.fetchQuery);
  }
}

export function removeDrilldown(levelName) {
  const {options, query} = this.props;
  const {queryUpdate} = this.context;
  const level = options.levels.find(lvl => lvl.name === levelName);

  if (level) {
    queryUpdate({
      drilldowns: query.drilldowns.filter(lvl => lvl !== level)
    }).then(this.fetchQuery);
  }
}
