/**
 * The object that this file exports is used to set configurations for canon
 * and it's sub-modules.
 */

module.exports = {
  reduxMiddleware(applyMiddleware, canonMiddleware) {
    /**
     * You can apply any of these recipes freely
     * @see https://www.npmjs.com/package/redux-logger#recipes
     */
    if (process.env.NODE_ENV !== "production") {
      const {createLogger} = require("redux-logger");
      const logger = createLogger({
        collapsed: (getState, action, logEntry) => !logEntry?.error
      });

      /**
       * logger must be the last middleware in chain,
       * otherwise it will log thunk and promise, not actual actions
       * @see https://github.com/evgenyrodionov/redux-logger/issues/20
       */
      canonMiddleware.push(logger);
    }

    return applyMiddleware(...canonMiddleware);
  }
};
