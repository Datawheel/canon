import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Mapa from "./pages/Map";
import Visualize from "./pages/Visualize";
import SelectPage from "./pages/Select";
import MultiSelectPage from "./pages/MultiSelect";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="map" component={Mapa} />
      <Route path="visualize" component={Visualize} />
      <Route path="select" component={SelectPage} />
      <Route path="multiselect" component={MultiSelectPage} />
    </Route>
  );
}
