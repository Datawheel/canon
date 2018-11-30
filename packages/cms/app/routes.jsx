import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
//import Home from "./pages/Home";
import Builder from "../src/Builder";
import Search from "./pages/Search";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Builder} />
      <Route path="/search" component={Search} />
    </Route>
  );
}
