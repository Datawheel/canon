import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "components/App";
import Home from "pages/Home";

export default function RouteCreate() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
    </Route>
  );
}
