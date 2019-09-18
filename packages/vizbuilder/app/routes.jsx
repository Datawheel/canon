import React from "react";
import {browserHistory, IndexRoute, Route} from "react-router";
import App from "./App";
import Home from "./pages/Home";
import Visualize from "./pages/Visualize";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      {/* <Route path="map" component={Mapa} /> */}
      <Route path="visualize" component={Visualize} />
      {/* <Route path="select" component={SelectPage} /> */}
      {/* <Route path="multiselect" component={MultiSelectPage} /> */}
    </Route>
  );
}
