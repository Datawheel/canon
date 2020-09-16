/**
 * This object will be used to pre-populate the redux store with any
 * static values you may need.
 */
export const initialState = {};

/**
 * This array can contain redux middlewares that will be used in the
 * redux store. The loggerMiddleware is provided as an example.
 */
export const middleware = [];

if (__DEV__ && !__SERVER__) {
  const {createLogger} = require("redux-logger");

  // You can apply any of these recipes freely
  // https://www.npmjs.com/package/redux-logger#recipes
  const loggerMiddleware = createLogger({
    collapsed: (getState, action, logEntry) => !logEntry || !logEntry.error
  });
  middleware.push(loggerMiddleware);
}

/**
 * This object should contain reducers to be combined with the internal
 * default canon reducers.
 */
export const reducers = {};
