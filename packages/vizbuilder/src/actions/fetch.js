import * as api from "../helpers/api";

export function fetchCubes() {
  const {loadCycle, queryUpdate, optionsUpdate} = this.context;
  const load = loadCycle();

  return load
    .start()
    .then(api.cubes)
    .then(cubes => {
      const cube = cubes[0];

      return Promise.all([
        optionsUpdate({
          cubes,
          measures: cube.measures,
          levels: cube.dimensions.reduce(
            (jall, dim) =>
              jall.concat(
                dim.hierarchies.reduce(
                  (kall, hie) => kall.concat(hie.levels),
                  []
                )
              ),
            []
          )
        }),
        queryUpdate({
          cube,
          measures: cube.defaultMeasure
        })
      ]);
    })
    .then(load.resolved, load.rejected)
    .then(this.setState.bind(this, {lastUpdate: Date.now()}));
}

export function fetchMembers(level) {
  const {loadCycle, optionsUpdate} = this.context;
  const load = loadCycle();

  return load
    .start()
    .then(() => api.members(level))
    .then(members =>
      optionsUpdate({
        members: {
          [level.fullName]: members
        }
      })
    )
    .then(load.resolved, load.rejected)
    .then(this.setState.bind(this, {lastUpdate: Date.now()}));
}

export function fetchQuery() {
  const {query, loadCycle, datasetUpdate} = this.context;
  const load = loadCycle();

  return load
    .start()
    .then(() => api.query(query))
    .then(result => {
      const data = result.data || {};
      return datasetUpdate(data.data);
    })
    .then(load.resolved, load.rejected)
    .then(this.setState.bind(this, {lastUpdate: Date.now()}));
}
