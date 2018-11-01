import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "App";
import Home from "pages/Home";
import Slug from "pages/Slug";
import Login from "pages/Login";
import SignUp from "pages/SignUp";
import Profile from "profile/Profile";

import {Reset, UserAdmin} from "../src";

/** */
function checkForId(nextState, replaceState) {
  if (!nextState.params.id) {

    const reqestedUrl = nextState.location.pathname;
    const randId = "040AF00008";

    const nextUrl = reqestedUrl.slice(-1) === "/"
      ? `${reqestedUrl}${randId}`
      : `${reqestedUrl}/${randId}`;

    replaceState(`/${nextUrl}#thing?key=1`);

  }
}

class Wrapper extends React.Component {
  render() {
    return <div id="Wrapper">{this.props.children}</div>;
  }
}

/** */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="signup" component={SignUp} />
      <Route path="login" component={Login} />
      <Route path="reset" component={Reset} />
      <Route path="test/:slug" component={Slug} />
      <Route path=":lang/profile/:id" component={Profile} />
      <Route path="profile(/:id)" onEnter={checkForId} component={Profile} />
      <Route path="/admin" component={Wrapper}>
        <IndexRoute component={UserAdmin} />
        <Route path="/admin/nested" component={UserAdmin} />
      </Route>
    </Route>
  );

}
