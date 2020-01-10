import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Search from "./pages/Search";
import ProfileSearchPage from "./pages/ProfileSearchPage";
import Bar from "./pages/Bar";

import {Builder, Profile, Story, StoryLanding} from "../src";

import Showcase from "../src/components/Showcase";

/** */
export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Builder} />
      <Route path="/design-system(/:slug)" component={Showcase} />
      <Route path="/profile/:slug/:id" component={Profile} />
      <Route path="/profile/:slug/:id/:slug2/:id2" component={Profile} />
      <Route path="/profile/:slug/:id/:slug2/:id2/:slug3/:id3" component={Profile} />
      <Route path="/story/:slug" component={Story} />
      <Route path="/stories" component={StoryLanding} />
      <Route path="/search" component={Search} />
      <Route path="/profilesearch" component={ProfileSearchPage} />
      <Route path="/bar" component={Bar} />
    </Route>
  );
}
