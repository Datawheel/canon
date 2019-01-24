import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Profile from "./pages/Profile";
import Builder from "../src/Builder";
import Search from "./pages/Search";
import Bar from "./pages/Bar";

/** */
export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Search} />
      <Route path="/profile/:pslug/:pid" component={Profile} />
      <Route path="/cms" component={Builder} />
      <Route path="/bar" component={Bar} />
    </Route>
  );
}
