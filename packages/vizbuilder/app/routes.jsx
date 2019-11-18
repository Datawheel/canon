import React from "react";
import {IndexRoute, Route} from "react-router";
import App from "./App";
import Chilecracia from "./pages/Chilecracia";
import DataMexico from "./pages/DataMexico";
import DataUSAMap from "./pages/DataUSAMap";
import DataUSAViz from "./pages/DataUSAViz";
import Home from "./pages/Home";

export default function RouteCreate() {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="chilecracia" component={Chilecracia} />
      <Route path="datamexico" component={DataMexico} />
      <Route path="datausa/">
        <Route path="visualize" component={DataUSAViz} />
        <Route path="map" component={DataUSAMap} />
      </Route>
    </Route>
  );
}
