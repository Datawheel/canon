# @datawheel/canon-core

## Environment Variables

### Additional Environment Variables

Interacting with the internals of canon is done by specifying environment variables. The recommended way to set environment variables is to use `direnv` (installed with `brew install direnv`), which will detect any file named `.envrc` located in a project folder. This file should not be pushed to the repository, as it usually contains variables specific to the current environment (testing locally, running on a server etc).

Here is an example `.envrc` file which turns off the default redux messages seen in the browser console and changes the default localization language:

```sh
export CANON_LOGREDUX=false
export CANON_LANGUAGE_DEFAULT="es"
```

|variable|description|default|
|---|---|---|
|`CANON_API`|Used as a prefix with the fetchData action and the attribute types returned from the `ATTRS` url.|`undefined`|
|`CANON_BASE_URL`|If hosting assets or running the server from a different location that the project folder, this variable can be used to define the base URL for all static assets. A `<base>` tag will be added to the start of the `<head>` tag.|`undefined`|
|`CANON_GOOGLE_ANALYTICS`|The unique Google Analytics ID for the project (ex. `"UA-########-#"`). This also supports comma-separated values, if it's desired for pageviews to be reported to multiple analytics properties.|`undefined`|
|`CANON_FACEBOOK_PIXEL`|The unique Facebook Pixel ID for the project (ex. `"################"`).|`undefined`|
|`CANON_GOOGLE_TAG_MANAGER`|The unique Google Tag Manager ID for the project (ex. `"GTM-#######"`).|`undefined`|
|`CANON_HELMET_FRAMEGUARD`|Pass-through option for the "frameguard" property of the [helmet](https://github.com/helmetjs/helmet#how-it-works) initialization.|`false`|
|`CANON_HOTJAR`|The unique Hotjar ID for the project (ex. `"#######"`).|`undefined`|
|`CANON_LOGREDUX`|Whether or not to display the (rather verbose) Redux store events in the browser console.|`true`|
|`CANON_LOGLOCALE`|Whether or not to display the (rather verbose) i18n locale events in the browser console.|`false`|
|`CANON_PORT`|The port to use for the server.|`3300`|
|`CANON_SESSION_SECRET`|A unique secret key to use for cookies.|The "name" field from package.json|
|`CANON_SESSION_TIMEOUT`|The timeout, in milliseconds, for user authentication cookies.|`60 * 60 * 1000` (one hour)|
|`CANON_STATIC_FOLDER`|Changes the default folder name for static assets.|`"static"`|
|`NODE_ENV`|The current environment. Setting to `production` will result in the removal of browser development tools and return smaller package sizes.|`development`|

Additional environment variables can also be set (and may be required) for canon plugins:

* [cms](https://github.com/Datawheel/canon/tree/master/packages/cms#environment-variables)
* [logiclayer](https://github.com/Datawheel/canon/tree/master/packages/logiclayer#canon-logic-layer)

### Custom Environment Variables

In addition to the predefined environment variabels, you can also pass any variable to the front-end using the `CANON_CONST_*` wildcard naming convention. Any environment variable that begins with `CANON_CONST_` will be passed through to the redux store to be available in the front-end. For example, given the following environment variable:

```sh
export CANON_CONST_API2=https://api.datausa.io/
```

This variable can now be referenced as `API2` in a front-end React component:

```jsx
import React, {Component} from "react";
import {connect} from "react-redux";

class Viz extends Component {

  render() {

    const {API2} = this.props;

  }

}

const mapStateToProps = state => ({
  API2: state.env.API2
});

export default connect(mapStateToProps)(Viz);
```
