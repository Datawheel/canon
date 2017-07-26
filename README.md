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

Interacting with the internals of canon is done by specifying environment variables. The most common way to set environment variables is to use `autoenv` (installed with `brew install autoenv`), which will detect any file named `.env` located in a project folder. This file should not be pushed to the repository, as it usually contains variables specific to the current environment (testing locally, running on a server etc).

Here is an example `.env` file which turns off the default redux messages seen in the browser console and changes the default localization language:

```sh
export CANON_LOGREDUX=false
export CANON_LANGUAGE_DEFAULT="es"
```

*Z shell users*: when installing `autoenv`, the following line needs to be placed in your shell config (usually `~/.zshrc`):

```sh
source /usr/local/opt/autoenv/activate.sh
```

|variable|description|default|
|---|---|---|
|`CANON_API`|Used as a prefix with the fetchData action and the attribute types returned from the `ATTRS` url.|`undefined`|
|`CANON_ATTRS`|A URL that should return a list of attribute classification strings to be pre-cached and passed to the default redux store.|`undefined`|
|`CANON_DB_NAME`|Postgres database name.|`undefined`|
|`CANON_DB_USER`|Postgres database user.|`undefined`|
|`CANON_DB_HOST`|Postgres database host.|`"127.0.0.1"`|
|`CANON_DB_PW`|Postgres database password.|`null`|
|`CANON_FACEBOOK_API`|The Facebook App ID used for social logins. See the [Social Logins](#Social-Logins) section of this documentation for a step-by-step guide on setting up each social service.|`undefined`|
|`CANON_FACEBOOK_SECRET`|The Facebook App Secret used for social logins. See the [Social Logins](#Social-Logins) section of this documentation for a step-by-step guide on setting up each social service.|`undefined`|
|`CANON_GOOGLE_ANALYTICS`|The unique Google Analytics ID for the project (ex. `"UA-########-#"`).|`undefined`|
|`CANON_HELMET_FRAMEGUARD`|Pass-through option for the "frameguard" property of the [helmet](https://github.com/helmetjs/helmet#how-it-works) initialization.|`false`|
|`CANON_LANGUAGES`|A comma-separated list of languages to be used in generating localization bundles.|`"en"`|
|`CANON_LANGUAGE_DEFAULT`|The default/fallback language for the site.|`"en"`|
|`CANON_LOGINS`|Whether or not to attach views and connect database table for user login and management.|`false`|
|`CANON_LOGREDUX`|Whether or not to display the (rather verbose) Redux store events in the browser console.|`true`|
|`CANON_PORT`|The port to use for the server.|`3300`|
|`CANON_SESSION_SECRET`|A unique secret key to use for cookies.|The "name" field from package.json|
|`CANON_SESSION_TIMEOUT`|The timeout, in milliseconds, for user authentication cookies.|`3600000` (one hour)|
|`NODE_ENV`|The current environment. Setting to `production` will result in the removal of browser development tools and return smaller package sizes.|`development`|

## Social Logins

### Setting up Facebook Logins
1. [https://developers.facebook.com](https://developers.facebook.com)
2. Hover over "My Apps" in the top right of the page and click "Add a New App"
3. Set up "Facebook Login" as the product.
4. Choose "Web" as the Platform.
5. Skip the Quickstart guide and go directly to "Settings" in the sidebar. Your settings should look like the following image, with at the very least `http://localhost:3300/auth/facebook/callback` in the Valid OAuth redirect URIs. Once there is a production URL, you will need to add that callback URL here along with localhost. ![](https://github.com/datawheel/datawheel-canon/raw/master/docs/facebook-oauth.png)
6. Go to "Settings" > "Advanced" and turn on "Allow API Access to App Settings" (at the time of writing, it was the last toggle in the "Security" panel)
7. Go to "Settings" > "Basic" and copy the App ID and App Secret to your environment as the following variables:
```sh
export CANON_FACEBOOK_API="###############"
export CANON_FACEBOOK_SECRET="##############################"
```

### Setting up Twitter Logins
1. [https://apps.twitter.com](https://apps.twitter.com)
2. Once logged in, click the "Create New App" button on the top right of the page.
3. Fill out the meta information about your project, but specifically set the "Callback URL" to `http://localhost:3300/auth/twitter/callback`.
7. Go to the "Key and Access Tokens" tab and copy the Consumer Key (API Key) and Consumer Secret (API Secret) to your environment as the following variables:
```sh
export CANON_TWITTER_API="###############"
export CANON_TWITTER_SECRET="##############################"
```
