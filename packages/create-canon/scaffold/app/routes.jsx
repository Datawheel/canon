import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";

function createRoute() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
    </Route>
  );
}

export default createRoute;
