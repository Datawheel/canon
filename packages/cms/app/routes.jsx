import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Search from "./pages/Search";
import PercentageBar from "../src/components/Viz/PercentageBar";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/bar" component={PercentageBar} />
    </Route>
  );
}
