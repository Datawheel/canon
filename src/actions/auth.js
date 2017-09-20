import axios from "axios";
import {LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT_FAILURE, LOGOUT_SUCCESS, SIGNUP_EXISTS, SIGNUP_FAILURE, SIGNUP_REQUEST, SIGNUP_SUCCESS, WRONG_PW} from "../consts";

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
