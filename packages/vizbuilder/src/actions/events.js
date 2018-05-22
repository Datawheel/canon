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
  const {options, queryUpdate, optionsUpdate} = this.context;

  const cube = options.cubes.find(cube => cube.measures.indexOf(measure) > -1);
  const levels = getValidDrilldowns(cube);

  optionsUpdate({levels});
  queryUpdate({
    cube,
    measure,
    drilldowns: levels.slice(0, 1)
  })
    .then(this.fetchQuery)
    .then(this.updateLocalContext);
}

export function setDrilldown(level) {
  const {query, options, queryUpdate} = this.context;

  if (options.levels.indexOf(level) > -1) {
    queryUpdate({
      drilldowns: [].concat(query.drilldowns, level)
    })
      .then(this.fetchQuery)
      .then(this.updateLocalContext);
  }
}

export function removeDrilldown(levelName) {
  const {query, options, queryUpdate} = this.context;
  const level = options.levels.find(lvl => lvl.name === levelName);

  if (level) {
    queryUpdate({
      drilldowns: query.drilldowns.filter(lvl => lvl !== level)
    })
      .then(this.fetchQuery)
      .then(this.updateLocalContext);
  }
}
