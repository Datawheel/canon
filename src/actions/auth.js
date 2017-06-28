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

export const login = loginUserData => dispatch => {

  dispatch(loginRequest());

  axios.post("/auth/local/login", loginUserData)
    .then(resp => {
      dispatch(loginSuccess(resp.data));
      window.location = "/";
    })
    .catch(() => dispatch(loginFailure({
      msg: "Wrong username or password.",
      type: "WRONG_PW",
      email: loginUserData.email
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

  axios.post("/auth/local/signup", userData)
    .then(resp => {
      dispatch({type: "SIGNUP_SUCCESS", payload: resp.data});
      window.location = "/";
    })
    .catch(err => dispatch(signupFailure(err)));

};
