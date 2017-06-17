# datawheel-canon
Reusable React environment and components for creating visualization engines.

## Scripts

|script name|description|
|---|---|
|`canon-build`|Create all of the necessary bundles for a production deployment.|
|`canon-dev`|Starts up a development server with hot-reloading.|
|`canon-locales`|Parses all files in the `./app` directory for strings either wrapped in a `t()` function or part of an `<Interpolate>` component. These strings will then be matched with any existing translation files that exist, resulting in JSON lookup files for every language specified in the environment variable. These files can be found in `./locales/<lang>/canon.json`.|
|`canon-start`|Starts up a web server for a production environment.|

## Environment Variables

|variable|description|default|
|---|---|---|
|`API`|Used as a prefix with the fetchData action and the attribute types returned from the `ATTRS` url.|`undefined`|
|`ATTRS`|A URL that should return a list of attribute classification strings to be pre-cached and passed to the default redux store.|`undefined`|
|`GOOGLE_ANALYTICS`|The unique Google Analytics ID for the project (ex. `"UA-########-#"`).|`undefined`|
|`LANGUAGES`|A comma-separated list of languages to be used in generating localization bundles.|`"en"`|
|`LANGUAGE_DEFAULT`|The default/fallback language for the site.|`"en"`|
|`LOGREDUX`|Whether or not to display the (rather verbose) Redux store events in the browser console.|`true`|
|`NODE_ENV`|The current environment. Setting to `production` will result in the removal of browser development tools and return smaller package sizes.|`development`|
|`PORT`|The port to use for the server.|`3300`|
