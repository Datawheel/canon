import React from "react";
import {IndexRoute, Route} from "react-router";
import App from "./App";
import NewVizbuilder from "./pages/New";

export default function RouteCreate() {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={NewVizbuilder} />
      {/* <Route path="map" component={Mapa} /> */}
      {/* <Route path="visualize" component={Visualize} /> */}
      {/* <Route path="select" component={SelectPage} /> */}
      {/* <Route path="multiselect" component={MultiSelectPage} /> */}
    </Route>
  );
}
