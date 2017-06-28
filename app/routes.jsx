import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "components/App";
import Home from "pages/Home";
import Profile from "profile/Profile";

import {Login, SignUp} from "../src";

export default function RouteCreate() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="signup" component={SignUp} />
      <Route path="login" component={Login} />
      <Route path="profile/:id" component={Profile} />
    </Route>
  );

}
