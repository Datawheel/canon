//@ts-check
import {Intent, Position, Toaster} from "@blueprintjs/core";
import {fetchQuery} from "./fetch";
import {generateQueries} from "./query";
import {higherTimeLessThanNow} from "./sorting";

const UIToaster =
  typeof window !== "undefined"
    ? Toaster.create({className: "toaster", position: Position.TOP})
    : null;

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
export function loadControl(preQuery, postQuery) {
  const {datacap} = this.props;
  const initialState = this.state;
  let promise = Promise.resolve(null);

  // this accepts preQuery to return a value or a promise
  if (typeof preQuery === "function") {
    promise = promise.then(preQuery);
  }

  promise = promise.then(result => {
    const finalState = mergeStates(initialState, result || {});
    const query = finalState.query;
    const queries = generateQueries(query);

    return setStatePromise
      .call(this, currentState => {
        /**
         * Update 1
         * Calculates state for the next query, generates queries,
         * sets `load.inProgress = true` to activate the loading screen,
         * saves the queries, and updates the state.
         */
        finalState.load = {
          ...currentState.load,
          inProgress: true,
          total: queries.length
        };
        finalState.queries = queries;
        return finalState;
      })
      .then(() => {
        const fetchings = queries.map(query =>
          fetchQuery(datacap, query).then(result => {
            return setStatePromise
              .call(this, currentState => {
                /**
                 * Progress update
                 * After each query is fetched from the server,
                 * the counter adds 1.
                 */
                return {
                  load: {
                    ...currentState.load,
                    done: currentState.load.done + 1
                  }
                };
              })
              .then(() => result);
          })
        );
        return Promise.all(fetchings);
      })
      .then(results => {
        const datasets = [];
        const members = [];

        const timeLevel = query.timeLevel;
        const activeQueryKey = `${query.activeChart}`.split("-")[0];
        const activeChart = queries.some(q => q.key === activeQueryKey)
          ? query.activeChart
          : null;

        let n = results.length;
        while (n--) {
          const result = results[n];
          datasets.unshift(result.dataset);
          members.unshift(result.members);
        }

        const selectedTime =
          timeLevel && higherTimeLessThanNow(members[0], timeLevel.name);

        return setStatePromise.call(this, currentState =>
          mergeStates(currentState, {
            datasets,
            members,
            query: {activeChart, selectedTime}
          })
        );
      });
  });

  // this accepts postQuery to return a value or a promise
  if (typeof postQuery === "function") {
    promise = promise.then(postQuery);
  }

  promise = promise
    .then(result =>
      setStatePromise.call(this, {
        ...result,
        load: {
          inProgress: false,
          total: 0,
          done: 0,
          lastUpdate: Math.random(),
          error: null,
          severity: Intent.NONE
        }
      })
    )
    .then(null, err =>
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
          if (__DEV__) {
            console.group("STATE UPDATE ERROR");
            console.error(err.message);
            console.error(err.stack);
            console.groupEnd();
          }
          UIToaster.show({
            intent: getSeverityByError(err),
            message: err.message
          });
        })
    );

  if (__DEV__) {
    promise = promise.then(() => {
      console.groupCollapsed("FINAL STATE");
      console.table(this.state.queries);
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
  if ("response" in error) {
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
  const finalState = {...state};
  const keys = Object.keys(newState);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (/^queries|^datasets|^members|^meta/.test(key)) {
      finalState[key] = newState[key];
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
