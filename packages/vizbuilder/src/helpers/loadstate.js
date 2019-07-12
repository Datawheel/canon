import {Intent, Position, Toaster} from "@blueprintjs/core";

import chartCriteria from "./chartCriteria";
import {datagroupToCharts} from "./chartHelpers";
import {fetchQuery} from "./fetch";
import {generateQueries} from "./query";
import {higherTimeLessThanNow} from "./sorting";
import chartCollision from "./chartCollision";

const UIToaster =
  typeof window !== "undefined"
    ? Toaster.create({className: "toaster", position: Position.TOP})
    : null;

/**
 * Returns a severity level (based on blueprint's Intent scale) depending
 * on the type of error passed.
 * @param {import("./errors").VizbuilderError} error An Error object
 */
function getSeverityByError(error) {
  if ("severity" in error) {
    return error.severity;
  }
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

/**
 * Executes a change in the Vizbuilder state, while controlling the appearance
 * of the loading screen and progress bar. It also stores error objects for
 * easier debugging.
 * @returns {Promise<void>}
 */
export function fetchControl(preQuery, postQuery) {
  const generalConfig = this.getGeneralConfig();
  const {datacap} = this.props;
  const initialState = this.getState();

  return this.props.dispatch(dispatch => {
    let promise = Promise.resolve(null);

    // this accepts preQuery to return a value or a promise
    if (typeof preQuery === "function") {
      promise = promise.then(preQuery);
    }

    promise = promise.then(result => {
      let {activeChart = null, showConfidenceInt = false} = {
        ...initialState.uiParams,
        ...result.uiParams
      };
      const updatedQuery = {...initialState.query, ...result.query};
      const queries = generateQueries(updatedQuery);

      dispatch({
        state: result,
        total: queries.length,
        type: "VB_FETCH_INIT"
      });

      const fetchOperations = queries.map(query =>
        fetchQuery(query, {showConfidenceInt, datacap}).then(result => {
          dispatch({type: "VB_FETCH_PROGRESS"});
          return result;
        })
      );

      return Promise.all(fetchOperations).then(results => {
        const datagroups = chartCriteria(results, generalConfig);
        let charts = [];

        let selectedTime = Infinity;
        let i = datagroups.length;
        while (i--) {
          const datagroup = datagroups[i];
          const {timeLevelName} = datagroup.names;

          const dgTimeList = datagroup.members[timeLevelName];
          selectedTime = Math.min(selectedTime, higherTimeLessThanNow(dgTimeList));

          const dgCharts = datagroupToCharts(datagroup, generalConfig);
          charts.push.apply(charts, dgCharts);
        }

        charts = chartCollision(charts);

        // activeChart example: treemap-z9TnC_1cDpEA
        if (
          initialState.uiParams.activeChart &&
          initialState.charts.length === 1 &&
          charts.length > 1
        ) {
          activeChart = null;
        }
        else if (charts.length === 1) {
          activeChart = charts[0].key;
        }
        else if (charts.map(ch => ch.key).indexOf(activeChart) === -1) {
          activeChart = null;
        }

        const uiParams = {activeChart, selectedTime, showConfidenceInt};

        return {charts, datagroups, uiParams};
      });
    });

    // this accepts postQuery to return a value or a promise
    if (typeof postQuery === "function") {
      promise = promise.then(postQuery);
    }

    promise = promise
      .then(result => dispatch({type: "VB_FETCH_FINISH", state: result}))
      .then(null, error => {
        dispatch({error, state: initialState, type: "VB_FETCH_ERROR"});
        if (__DEV__) {
          console.group("STATE UPDATE ERROR");
          console.error(error.message);
          console.error(error.stack);
          console.groupEnd();
        }
        UIToaster.show({
          intent: getSeverityByError(error),
          message: error.message
        });
      });

    return promise;
  });
}
