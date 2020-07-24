import {cmsReducer} from "@datawheel/canon-cms";
import {createLogger} from "redux-logger";

/** */
export const initialState = {};

/** */
export const middleware = [];

if (__DEV__ && !__SERVER__) {
  const loggerMiddleware = createLogger({
    collapsed: (getState, action, logEntry) => !logEntry.error
  });
  middleware.push(loggerMiddleware);
}

/**
 * The object exported by this file should contain reducers to be
 * combined with the internal default canon reducers.
 */
export const reducers = {
  cms: cmsReducer
};
