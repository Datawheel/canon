import React from "react";
import {Route, IndexRoute} from "react-router";


import App from "./App";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Error from "./pages/core/NotFound";

/** */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>

      <IndexRoute component={Home} />

      <Route path="docs/:pkg/:page" component={Docs} />

      <Route path="*" component={Error} />

    </Route>
  );

}
