/**
    The object that this file exports is used to set configurations for canon
    and it's sub-modules.
*/
function exampleReduxMiddleware(canonMiddleware) {
  return canonMiddleware;
}
module.exports = {
  reduxMiddleware(applyMiddleware, canonMiddleware) {
    console.log("reduxMiddleware from canon.js");
    return applyMiddleware(...exampleReduxMiddleware(canonMiddleware));
  }
};
