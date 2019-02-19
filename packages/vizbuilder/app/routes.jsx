import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Mapa from "./pages/Map";
import Visualize from "./pages/Visualize";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="map" component={Mapa} />
      <Route path="visualize" component={Visualize} />
    </Route>
  );
}
