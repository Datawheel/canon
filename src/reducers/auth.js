const defaultState = {
  loading: false,
  msg: null,
  error: null,
  user: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
    case "SIGNUP_REQUEST":
      return {...state, loading: true, error: null};
    case "LOGIN_SUCCESS":
      return {...state, loading: false, error: null, user: action.payload};
    case "LOGOUT_SUCCESS":
      return {...state, loading: false, error: action.payload.msg, user: null};
    case "LOGIN_FAILURE":
    case "SIGNUP_FAILURE":
      return {...state, loading: false, error: action.payload, user: null};
    default:
      return state;
  }
};
