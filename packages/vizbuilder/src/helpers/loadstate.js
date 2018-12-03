import {Intent, Position, Toaster} from "@blueprintjs/core";

import chartCriteria from "./chartCriteria";
import {datagroupToCharts} from "./chartHelpers";
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
    const vbQuery = finalState.query;
    const queries = generateQueries(vbQuery);

    /**
     * Update 1
     * Calculates state for the next query, generates queries,
     * sets `load.inProgress = true` to activate the loading screen,
     * saves the queries, and updates the state.
     */
    return setStatePromise
      .call(this, currentState => {
        finalState.load = {
          ...currentState.load,
          inProgress: true,
          total: queries.length
        };
        finalState.datagroups = [];
        return finalState;
      })
      .then(() => {
        const fetchings = queries.map(query =>
          fetchQuery(datacap, query).then(result => {
            /**
             * Progress update
             * After each query is fetched from the server,
             * the counter adds 1.
             */
            return setStatePromise
              .call(this, currentState => ({
                load: {
                  ...currentState.load,
                  done: currentState.load.done + 1
                }
              }))
              .then(() => result);
          })
        );
        return Promise.all(fetchings);
      })
      .then(results => {
        const generalConfig = this.getGeneralConfig();
        const isGeomapOnly =
          generalConfig.visualizations.length === 1 &&
          generalConfig.visualizations[0] === "geomap";

        const datagroups = chartCriteria(vbQuery, results, generalConfig);
        const charts = [];

        let selectedTime = Infinity;
        let i = datagroups.length;
        while (i--) {
          const datagroup = datagroups[i];

          const dgTimeList = datagroup.members[datagroup.names.timeLevelName];
          selectedTime = Math.min(
            selectedTime,
            higherTimeLessThanNow(dgTimeList)
          );

          const dgCharts = datagroupToCharts(datagroup, generalConfig);
          charts.push.apply(charts, dgCharts);
        }

        // activeChart example: treemap-z9TnC_1cDpEA
        let activeChart = null;
        if (charts.length === 1) {
          activeChart = charts[0].key;
        } else if (charts.map(ch => ch.key).indexOf(vbQuery.activeChart) > -1) {
          activeChart = vbQuery.activeChart;
        }

        return setStatePromise.call(this, currentState =>
          mergeStates(currentState, {
            charts,
            datagroups,
            query: {activeChart, isGeomapOnly, selectedTime}
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
      for (let key in this.state) {
        console.debug(key, this.state[key]);
      }
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
    if (Array.isArray(newState[key])) {
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
