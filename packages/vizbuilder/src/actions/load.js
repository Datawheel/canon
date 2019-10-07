export const LOAD_REQUEST = "vizbuilder/LOAD/REQUEST";
export const LOAD_SUCCESS = "vizbuilder/LOAD/SUCCESS";
export const LOAD_FAILURE = "vizbuilder/LOAD/FAILURE";

export const loadHandlers = (dispatch, {type}) => ({
  loadFailure: payload => dispatch({type: LOAD_FAILURE, payload, trigger: type}),
  loadRequest: payload => dispatch({type: LOAD_REQUEST, payload, trigger: type}),
  loadSuccess: payload => {
    dispatch({type: LOAD_SUCCESS, payload, trigger: type});
    return payload;
  }
});
