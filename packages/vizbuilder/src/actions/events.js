import {fetchQuery} from "./fetch";

export function setCube(cube) {
  const {options, queryUpdate, optionsUpdate} = this.context;

  if (options.cubes.indexOf(cube) > -1) {
    optionsUpdate({
      measures: cube.measures,
      levels: cube.dimensions.reduce(
        (jall, dim) =>
          jall.concat(
            dim.hierarchies.reduce((kall, hie) => kall.concat(hie.levels), [])
          ),
        []
      )
    });
    queryUpdate({
      cube,
      drillDowns: [],
      measures: cube.measures.slice(0, 1)
    }).then(fetchQuery.bind(this));
  }
}

export function setLevel(level) {
  const {query, options, queryUpdate} = this.context;

  if (options.levels.indexOf(level) > -1) {
    queryUpdate({
      drillDowns: [].concat(query.drillDowns, level)
    }).then(fetchQuery.bind(this));
  }
}

export function removeLevel(levelName) {
  const {query, options, queryUpdate} = this.context;
  const level = options.levels.find(lvl => lvl.name === levelName);

  if (level) {
    queryUpdate({
      drillDowns: query.drillDowns.filter(lvl => lvl !== level)
    }).then(fetchQuery.bind(this));
  }
}

export function setMeasure(measure) {
  const {options, queryUpdate, optionsUpdate} = this.context;

  if (options.measures.indexOf(measure) > -1) {
    optionsUpdate({
      measures: [].concat(options.measures, measure)
    });
    queryUpdate({
      measures: [measure]
      // measures: [].concat(state.query.measures, measure)
    }).then(fetchQuery.bind(this));
  }
}
