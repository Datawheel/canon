import {Intent, Position, Toaster} from "@blueprintjs/core";

const UIToaster =
  typeof window !== "undefined"
    ? Toaster.create({className: "toaster", position: Position.TOP})
    : null;

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

/**
 * Executes a change in the Vizbuilder state, while controlling the appearance
 * of the loading screen and progress bar. It also stores error objects for
 * easier debugging.
 * @returns {Promise<void>}
 */
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
      setStatePromise.call(this, currentState => {
        newState.load = {done: currentState.load.done + 1};
        return mergeStates(currentState, newState);
      })
    );
  }

  promise = promise.then(
    setStatePromise.bind(this, {
      load: {
        inProgress: false,
        total: 0,
        done: 0,
        lastUpdate: Math.random(),
        error: null,
        severity: Intent.NONE
      }
    }),
    err => {
      setStatePromise
        .call(this, {
          ...initialState,
          load: {
            inProgress: false,
            total: 0,
            done: 0,
            error: err
          }
        })
        .then(() => {
          if (process.env.NODE_ENV !== 'production') {
            console.group("STATE UPDATE ERROR");
            console.error(err.message);
            console.error(err.stack);
            console.groupEnd();
          }
          UIToaster.show({
            intent: getSeverityByError(err),
            message: err.message
          });
        });
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    promise = promise.then(() => {
      console.groupCollapsed("FINAL STATE");
      console.table(this.state.query.groupings);
      console.groupEnd();
    });
  }

  return promise;
}

/**
 * Returns a severity level (based on blueprint's Intent scale) depending
 * on the type of error passed.
 * @param {Error} error An Error object
 */
function getSeverityByError(error) {
  if (error.response) {
    return Intent.WARNING;
  }
  return Intent.DANGER;
}

/**
 * Merges state objects up to 1 level deep in the overall state.
 * @param {object} state The initial state
 * @param {object} newState The new state to merge
 */
export function mergeStates(state, newState) {
  const finalState = {};
  const keys = Object.keys(newState);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (/^dataset|^members|^meta/.test(key)) {
      finalState[key] = newState[key];
    } else {
      finalState[key] = {
        ...state[key],
        ...newState[key]
      };
    }
  }

  return finalState;
}
