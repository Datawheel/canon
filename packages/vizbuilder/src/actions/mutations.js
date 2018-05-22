/* HELPER FUNCTIONS */

/**
 * Promisified `this.setState` function.
 *
 * Useful to trigger context updates and renderings after an state update,
 * all keeping a tidy promise chain.
 * Should always be handled with `Function.bind` and `Function.call` calls.
 * @param {object|Function} newState
 * @returns {Promise<void>}
 */
function setStatePromise(newState) {
  return new Promise(resolve => {
    this.setState(newState, resolve);
  });
}

/**
 * Promisified rejection catcher for the loadCycle helper.
 *
 * @param {number} n The number of loading elements this error covers.
 * @param {Error} err The catched error object.
 */
function setStateFetchError(n, err) {
  return setStatePromise.call(this, state => {
    const stillLoading = state.loadDone + n !== state.loadTotal;
    return {
      loading: stillLoading,
      loadTotal: stillLoading ? state.loadTotal : 0,
      loadDone: stillLoading ? state.loadDone + n : 0,
      loadError: err
    };
  });
}

/*
 * These functions belong to the Vizbuilder component.
 * Treat them as they were defined within the component itself.
 * The `this` element is the active instance of Vizbuilder.
 */

export function loadCycle(n) {
  n = n || 1;
  return {
    start: setStatePromise.bind(this, state => ({
      load: {
        loading: true,
        loadTotal: state.loadTotal + n
      }
    })),
    resolved: setStatePromise.bind(this, state => {
      const stillLoading = state.loadDone + n !== state.loadTotal;
      return {
        load: {
          loading: stillLoading,
          loadTotal: stillLoading ? state.loadTotal : 0,
          loadDone: stillLoading ? state.loadDone + n : 0
        }
      };
    }),
    rejected: setStateFetchError.bind(this, n)
  };
}

export function loadWrapper(...funcs) {
  const load = loadCycle.call(this, funcs.length);
  let promise = load.start();

  for (const func of funcs) {
    promise = promise.then(func);
  }

  return promise.then(load.resolved, load.rejected);
}

export function loadUpdate(newLoad) {
  return setStatePromise.call(this, state => ({
    load: {
      ...state.load,
      ...newLoad
    }
  }));
}

export function queryUpdate(newQuery) {
  return setStatePromise.call(this, state => ({
    query: {
      ...state.query,
      ...newQuery
    }
  }));
}

export function optionsUpdate(newOptions) {
  return setStatePromise.call(this, state => ({
    options: {
      ...state.options,
      ...newOptions
    }
  }));
}

export function datasetUpdate(newDataset) {
  return setStatePromise.call(this, {dataset: [].concat(newDataset || [])});
}
