import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Error from "./pages/core/NotFound";

import {ReportBuilder, MemberEditor, Report} from "@datawheel/canon-reports";
import {Login, SignUp} from "@datawheel/canon-core";

/** */
export default function RouteCreate() {

  return (
    <Route path="/" component={App}>

      <IndexRoute component={Home} />

      <Route path="docs/:pkg/:page" component={Docs} />

      <Route path="/reports" component={ReportBuilder} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/members" component={MemberEditor} />
      <Route path="/report/:slug/:id" component={Report} />

      <Route path="*" component={Error} status={404} />

    </Route>
  );

}
