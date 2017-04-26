export default (state = {}, action) => {
  switch (action.type) {
    case "GET_DATA_SUCCESS":
      return Object.assign({}, state, {[action.res.key]: action.res.data});
    default:
      return state;
  }
};
