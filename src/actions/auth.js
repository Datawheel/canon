import axios from "axios";

const loginRequest = () => ({type: "LOGIN_REQUEST"});

const loginSuccess = auth => ({
  type: "LOGIN_SUCCESS",
  payload: auth
});

const loginFailure = err => ({
  type: "LOGIN_FAILURE",
  payload: err
});

const signupRequest = () => ({type: "SIGNUP_REQUEST"});

const signupSuccess = auth => ({
  type: "SIGNUP_SUCCESS",
  payload: auth
});

const signupFailure = err => ({
  type: "SIGNUP_FAILURE",
  payload: err
});

const logoutSuccess = msg => ({
  type: "LOGOUT_SUCCESS",
  payload: msg
});

const logoutFailure = err => ({
  type: "SIGNUP_FAILURE",
  payload: err
});

export const login = userData => dispatch => {

  dispatch(loginRequest());

  axios.post("/auth/local/login", userData)
    .then(resp => {
      dispatch(loginSuccess(resp.data));
      window.location = "/";
    })
    .catch(() => dispatch(loginFailure({
      msg: "Wrong Username or Password",
      type: "WRONG_PW",
      email: userData.email
    })));

};

export const isAuthenticated = () => dispatch => {

  dispatch(loginRequest());

  axios.get("/auth/isAuthenticated")
    .then(resp => dispatch(loginSuccess(resp.data)))
    .catch(err => dispatch(loginFailure(err)));

};

export const logout = () => dispatch => {

  axios.get("/auth/logout")
    .then(resp => dispatch(logoutSuccess(resp.data)))
    .catch(err => dispatch(logoutFailure(err)));

};

export const signup = userData => dispatch => {

  dispatch(signupRequest());

  axios.post("/auth/local/signup", userData)
    .then(resp => {
      dispatch(signupSuccess(resp.data));
      window.location = "/";
    })
    .catch(() => dispatch(signupFailure({
      msg: "E-mail or Username already exists",
      type: "EXISTS",
      email: userData.email
    })));

};
