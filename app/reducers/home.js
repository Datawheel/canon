import {combineReducers} from "redux";

const data = (state = {}, action) => {
  switch (action.type) {
    case "GET_DATA_SUCCESS":
      return Object.assign({}, state, {[action.res.key]: action.res.data});
    default:
      return state;
  }
};

const homeReducer = combineReducers({
  data
});

export default homeReducer;
