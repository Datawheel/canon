import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "components/App";
import Home from "pages/Home";
import Login from "pages/Login";
import SignUp from "pages/SignUp";
import Profile from "profile/Profile";

import {Reset, UserAdmin} from "../src";

export default function RouteCreate() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="signup" component={SignUp} />
      <Route path="login" component={Login} />
      <Route path="reset" component={Reset} />
      <Route path="profile/:id" component={Profile} />
      <Route path="admin" component={UserAdmin} />
    </Route>
  );

}
