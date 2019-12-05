/**
  Simple test middleware function
*/
function exampleReduxMiddleware(canonMiddleware) {
  return canonMiddleware;
}

module.exports = {
  reduxMiddleware(applyMiddleware, canonMiddleware) {
    const message = "reduxMiddleware from canon.js";
    console.log(message);
    return applyMiddleware(...exampleReduxMiddleware(canonMiddleware));
  }
};
