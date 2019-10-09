import {createLogger} from "redux-logger";
import {vizbuilderMiddleware} from "./src";

export default {
  reduxMiddleware(applyMiddleware, middleware) {
    middleware = middleware.filter(fn => `${fn}`.indexOf(".startedTime") === -1);
    return applyMiddleware(
      vizbuilderMiddleware,
      createLogger({
        collapsed: (getState, action, logEntry) => !logEntry.error
      }),
      ...middleware
    );
  }
};
