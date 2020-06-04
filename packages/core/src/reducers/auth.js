import {
  ACTIVATE_SEND_FAILURE,
  ACTIVATE_SEND_REQUEST,
  ACTIVATE_SEND_SUCCESS,
  ACTIVATE_TOKEN_FAILURE,
  ACTIVATE_TOKEN_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_SUCCESS,
  RESET_PW_FAILURE,
  RESET_PW_SUCCESS,
  RESET_SEND_FAILURE,
  RESET_SEND_REQUEST,
  RESET_SEND_SUCCESS,
  RESET_TOKEN_SUCCESS,
  RESET_TOKEN_FAILURE,
  SIGNUP_EXISTS,
  SIGNUP_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  WRONG_PW
} from "../consts";

const defaultState = {
  loading: false,
  msg: null,
  error: null,
  user: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case RESET_SEND_REQUEST:
    case SIGNUP_REQUEST:
      return {...state, loading: true, error: null, msg: action.type};
    case ACTIVATE_SEND_REQUEST:
      return {...state, loading: true, msg: action.type};
    case LOGIN_SUCCESS:
    case SIGNUP_SUCCESS:
      return {...state, loading: false, error: null, msg: action.type, user: action.payload};
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
    case LOGOUT_FAILURE:
      return {...state, loading: false, error: action.payload.type, msg: null, user: null};
    case LOGOUT_SUCCESS:
      return {...state, loading: false, error: action.payload.type, msg: null, user: null};
    case ACTIVATE_TOKEN_SUCCESS:
    case ACTIVATE_SEND_SUCCESS:
    case RESET_PW_SUCCESS:
    case RESET_SEND_SUCCESS:
    case RESET_TOKEN_SUCCESS:
      return {...state, loading: false, msg: action.type, error: null};
    case ACTIVATE_TOKEN_FAILURE:
    case ACTIVATE_SEND_FAILURE:
    case RESET_PW_FAILURE:
    case RESET_SEND_FAILURE:
    case RESET_TOKEN_FAILURE:
    case SIGNUP_EXISTS:
    case WRONG_PW:
      return {...state, loading: false, error: action.type, msg: null};
    default:
      return state;
  }
};
