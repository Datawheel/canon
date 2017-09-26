import axios from "axios";
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

export const login = userData => dispatch => {

  dispatch({type: LOGIN_REQUEST});

  axios.post("/auth/local/login", userData)
    .then(resp => {
      dispatch({type: LOGIN_SUCCESS, payload: resp.data});
      window.location = "/";
    })
    .catch(() => dispatch({type: LOGIN_FAILURE, payload: {type: WRONG_PW, email: userData.email}}));

};

export const signup = userData => dispatch => {

  dispatch({type: SIGNUP_REQUEST});

  axios.post("/auth/local/signup", userData)
    .then(resp => {
      dispatch({type: SIGNUP_SUCCESS, payload: resp.data});
      window.location = "/";
    })
    .catch(() => dispatch({type: SIGNUP_FAILURE, payload: {type: SIGNUP_EXISTS, payload: userData}}));

};

export const isAuthenticated = () => dispatch => {

  dispatch({type: LOGIN_REQUEST});

  axios.get("/auth/isAuthenticated")
    .then(resp => dispatch({type: LOGIN_SUCCESS, payload: resp.data}))
    .catch(payload => dispatch({type: LOGIN_FAILURE, payload}));

};

export const logout = () => dispatch => {

  axios.get("/auth/logout")
    .then(resp => dispatch({type: LOGOUT_SUCCESS, payload: resp.data}))
    .catch(payload => dispatch({type: LOGOUT_FAILURE, payload}));

};

export const sendActivation = email => dispatch => {

  dispatch({type: ACTIVATE_SEND_REQUEST});

  axios.get(`/auth/sendActivation?email=${email}`)
    .then(resp => dispatch({type: resp.data.success ? ACTIVATE_SEND_SUCCESS : ACTIVATE_SEND_FAILURE}));

};

export const validateActivation = (email, token) => dispatch => {

  axios.get(`/auth/activate?email=${email}&token=${token}`)
    .then(resp => {
      dispatch({type: resp.data.success ? ACTIVATE_TOKEN_SUCCESS : ACTIVATE_TOKEN_FAILURE});
    });

};

export const resetPassword = email => dispatch => {

  dispatch({type: RESET_SEND_REQUEST});

  axios.get(`/auth/resetPassword?email=${email}`)
    .then(resp => dispatch({type: resp.data.success ? RESET_SEND_SUCCESS : RESET_SEND_FAILURE}));

};

export const validateReset = token => dispatch => {

  axios.get(`/auth/validateReset?token=${token}`)
    .then(resp => {
      dispatch({type: resp.data.success ? RESET_TOKEN_SUCCESS : RESET_TOKEN_FAILURE});
    });

};

export const changePassword = (token, password) => dispatch => {

  axios.post("/auth/changePassword", {token, password})
    .then(resp => {
      dispatch({type: resp.data.success ? RESET_PW_SUCCESS : RESET_PW_FAILURE});
    });

};
