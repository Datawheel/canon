import * as api from "./helpers/api";
import LOADINGSTATE from "./helpers/loading";
import store from "./store";

export function fetchCubes() {
  store.setState({
    loading: {
      fetching: true,
      total: 1,
      current: 0
    }
  });

  return api.cubes().then(cubes => {
    const state = store.getState();
    const cube = cubes[0];

    store.setState({
      options: {
        ...state.options,
        cubes: cubes,
        measures: cube.measures,
        levels: cube.dimensions.reduce((jall, dim) => {
              return jall.concat(
                dim.hierarchies.reduce((kall, hie) => {
                  return kall.concat(hie.levels);
                }, [])
              );
            }, [])
      },
      query: {
        ...state.query,
        cube: cube,
        // measures: cube.measures
        measure: cube.measures[0]
      },
      loading: {
        fetching: false,
        total: 0,
        current: 0
      }
    });
  });
}

export function fetchMembers(level) {
  store.setState({
    loading: {
      fetching: true,
      total: 1,
      current: 0
    }
  });

  return api.members(level).then(members => {});
}

export function setCube(cube) {
  const state = store.getState();

  if (state.options.cubes.indexOf(cube) > -1) {
    store.setState({
      options: {
        ...state.options,
        measures: cube.measures,
        levels: cube.dimensions.reduce((jall, dim) => {
          return jall.concat(
            dim.hierarchies.reduce((kall, hie) => {
              return kall.concat(hie.levels);
            }, [])
          );
        }, [])
      },
      query: {
        ...state.query,
        cube: cube,
        drilldowns: [],
        measure: cube.measures[0]
      }
    });
  }
}

export function setLevel(level) {
  const state = store.getState();

  if (state.options.levels.indexOf(level) > -1) {
    store.setState({
      query: {
        ...state.query,
        drilldowns: [].concat(state.query.drilldowns, level)
      }
    });
  }
}

export function removeLevel(levelName) {
  const state = store.getState();
  const level = state.options.levels.find(lvl => lvl.name == levelName);

  if (level) {
    store.setState({
      query: {
        ...state.query,
        drilldowns: state.query.drilldowns.filter(lvl => lvl != level)
      }
    })
  }
}

export function setMeasure(measure) {
  const state = store.getState();

  if (state.options.measures.indexOf(measure) > -1) {
    store.setState({
      options: {
        ...state.options,
        measures: [].concat(state.options.measures, measure)
      },
      query: {
        ...state.query,
        measure: measure
        // measures: [].concat(state.query.measures, measure)
      }
    });
  }
}
