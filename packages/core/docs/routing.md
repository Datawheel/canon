# @datawheel/canon-core

## Page Routing

All page routes need to be hooked up in `app/routes.jsx`. This filename and location cannot be changed, as the internals of Canon rely on it's presence. For linking between pages, use the [react-router](https://github.com/ReactTraining/react-router) `<Link>` component:

```jsx
import {Link} from "react-router";
...
<Link to="/about">About Page</Link>
```

As a fallback (mainly related to CMS content), Canon also intercepts all `<a>` tags and identifies whether or not they are client-side react friendly links or if they are external links that require a full window location change. If you need to trigger a browser reload (like when [changing languages](#changing-languages)), just add the `data-refresh` attribute to your HTML tag:

```jsx
<a data-refresh="true" href="/?locale=es">Spanish</a>
```

When linking to an anchor ID on the current page, use the `<AnchorLink>` component exported by canon to enable a silky smooth scrollto animation:

```jsx
import {AnchorLink} from "@datawheel/canon-core";
...
<AnchorLink to="economy">Jump to Economy</AnchorLink>
...
<a id="economy" href="#economy">Economy Section</a>
```

If needing to modify the page location with JavaScript, you must use the current active router passed down to any component registered in `app/routes.jsx`. In the past, it was possible to use the `browserHistory` object exported from [react-router](https://github.com/ReactTraining/react-router), but as more advanced routing features have been added to canon, it is now necessary to use the inherited live instance. This live instance is available as `this.props.router`, and can be passed down to any children needing it (either through props or context). Here is an example usage:

```jsx
import React, {Component} from "react";

class Tile extends Component {

  onChangePage() {
    const {router} = this.props;
    router.push("new-route");
  }

  onChangeQuery() {
    const {router} = this.props;
    router.replace("current-route?stuff=here");
  }

}
```

Notice the different usage of `push` and `replace`. Pushing a new URL to the router effects the push/pop history of the browser (so back and forward buttons work), which replacing the URL simply updates the value without effecting the browser history.

### Window Location

There are 3 preferred ways (each with their use cases) to determine the current page the user is viewing:

1. **redux `state.location`** - for server-side rendering, like if you need the current page in a `render` function when a component mounts. This object is created manually on the server-side to mimic `window.location`, but _does NOT get updated on subsequent react-router page views_.
2. **`this.props.router.location`** - every top-level component that is connected to a route in `routes.jsx` has access to the main react-router instance, which should be relied on to always contain the currently viewed page.
3. **`this.context.router.location`** - the current react-router instance is also passed down to every component via context.
