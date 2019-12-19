import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/home/:id" component={Home} />
      <Route path="/cart/:id" component={CartPage} />
    </Route>
  );
}
