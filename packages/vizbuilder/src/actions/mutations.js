function setStatePromise(newState) {
  return new Promise(resolve => {
    this.setState(newState, resolve);
  });
}

function setStateFetchError(n, err) {
  return setStatePromise.bind(this, state => {
    const stillLoading = state.loadDone + n !== state.loadTotal;
    return {
      loading: stillLoading,
      loadTotal: stillLoading ? state.loadTotal : 0,
      loadDone: stillLoading ? state.loadDone + n : 0,
      loadError: err
    };
  });
}

export function loadCycle(n) {
  n = n || 1;
  return {
    start: setStatePromise.bind(this, state => ({
      loading: true,
      loadTotal: state.loadTotal + n
    })),
    resolved: setStatePromise.bind(this, state => {
      const stillLoading = state.loadDone + n !== state.loadTotal;
      return {
        loading: stillLoading,
        loadTotal: stillLoading ? state.loadTotal : 0,
        loadDone: stillLoading ? state.loadDone + n : 0
      };
    }),
    rejected: setStateFetchError.bind(this, n)
  };
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
