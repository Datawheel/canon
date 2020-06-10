export default (state = {requests: 0, fulfilled: 0}, action) => {
  switch (action.type) {
    case "GET_DATA_REQUEST":
      return {...state, requests: state.requests + 1};
    case "GET_DATA_SUCCESS":
      return {...state, fulfilled: state.fulfilled + 1};
    case "LOADING_START":
    case "LOADING_END":
      return {requests: 0, fulfilled: 0};
    default:
      return state;
  }
};
