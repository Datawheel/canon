import {vizbuilderMiddleware} from "./src";

export default {
  reduxMiddleware(applyMiddleware, middleware) {
    return applyMiddleware(vizbuilderMiddleware, ...middleware)
  }
};
