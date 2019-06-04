/**
  Add custom middlewares here to be innitialized during CreateStore inside canon.
*/
// eslint-disable-next-line func-style
const customMiddleWare = function(store) {
  return function(next) {
    return function(action) {
      console.log("Custom middleware triggered:", action.type);
      next(action);
    };
  };
};

export default [customMiddleWare];
