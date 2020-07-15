import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Error from "./pages/core/NotFound";

import {Builder, Profile} from "@datawheel/canon-cms";

/** */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>

      <IndexRoute component={Home} />

      <Route path="docs/:pkg/:page" component={Docs} />

      <Route path="/cms" component={Builder} />
      <Route path="/profile/:slug/:id" component={Profile} />
      <Route path="/profile/:slug/:id/:slug2/:id2" component={Profile} />
      <Route path="/profile/:slug/:id/:slug2/:id2/:slug3/:id3" component={Profile} />

      <Route path="*" component={Error} />

    </Route>
  );

}
