import {LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT_FAILURE, LOGOUT_SUCCESS, SIGNUP_FAILURE, SIGNUP_REQUEST, SIGNUP_SUCCESS} from "../consts";

const defaultState = {
  loading: false,
  msg: null,
  error: null,
  user: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
      return {...state, loading: true, error: null, user: null};
    case LOGIN_SUCCESS:
    case SIGNUP_SUCCESS:
      return {...state, loading: false, error: null, user: action.payload};
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
    case LOGOUT_FAILURE:
      return {...state, loading: false, error: action.payload.type, user: null};
    case LOGOUT_SUCCESS:
      return {...state, loading: false, error: action.payload.type, user: null};
    default:
      return state;
  }
};
