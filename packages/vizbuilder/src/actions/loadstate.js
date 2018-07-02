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
export function setStatePromise(newState) {
  return new Promise(resolve => {
    this.setState(newState, resolve);
  });
}

export function loadControl() {
  const initialState = this.state;
  const funcs = Array.from(arguments);
  const total = funcs.length;

  let promise = setStatePromise.call(this, {
    load: {
      ...initialState.load,
      inProgress: true,
      total
    }
  });

  for (let i = 0; i < total; i++) {
    promise = promise.then(funcs[i]).then(newState =>
      setStatePromise.call(this, currentState =>
        mergeStates(currentState, {
          ...newState,
          load: {
            done: currentState.load.done + 1
          }
        })
      )
    );
  }

  return promise.then(
    setStatePromise.bind(this, {
      load: {
        inProgress: false,
        total: 0,
        done: 0,
        error: null
      }
    }),
    err =>
      setStatePromise.call(this, {
        ...initialState,
        load: {
          inProgress: false,
          total: 0,
          done: 0,
          error: err
        }
      })
  );
}

export function mergeStates(state, newState) {
  const finalState = {};
  const keys = Object.keys(newState);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === "dataset") {
      finalState.dataset = newState.dataset;
    }
    else {
      finalState[key] = {
        ...state[key],
        ...newState[key]
      };
    }
  }

  return finalState;
}
