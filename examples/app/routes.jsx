import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Error from "./pages/core/NotFound";

import {Builder, Profile, ProfileSearch} from "@datawheel/canon-cms";
import {Login, SignUp} from "@datawheel/canon-core";

/** */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>

      <IndexRoute component={Home} />

      <Route path="docs/:pkg/:page" component={Docs} />

      <Route path="/cms" component={Builder} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/:lang/profile/:slug/:id" component={Profile} />
      <Route path="/:lang/profile/:slug/:id/:slug2/:id2" component={Profile} />
      <Route path="/:lang/profile/:slug/:id/:slug2/:id2/:slug3/:id3" component={Profile} />
      <Route path="/:lang/profilesearch" component={ProfileSearch} />

      <Route path="*" component={Error} status={404} />

    </Route>
  );

}
