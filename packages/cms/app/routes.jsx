import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Search from "./pages/Search";
import Bar from "./pages/Bar";

import {Builder, Profile} from "../src";

/** */
export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Builder} />
      {/*
      <Route path="/cms-profile/:profileSlug" component={Builder} />
      <Route path="/cms-profile/:profileSlug/:topicSlug" component={Builder} />
      <Route path="/cms-story/:storySlug" component={Builder} />
      <Route path="/cms-story/:storySlug/:storytopicSlug" component={Builder} />
      */}
      <Route path="/profile/:pslug/:pid" component={Profile} />
      <Route path="/search" component={Search} />
      <Route path="/bar" component={Bar} />
    </Route>
  );
}
