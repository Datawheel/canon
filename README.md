# Canon
Reusable React environment and components for creating visualization engines.

![](https://github.com/datawheel/canon/raw/master/docs/bang.png)

#### Contents
* [Setup and Installation](#setup-and-installation)
* [Deployment](#deployment)
* [Header/Meta Information](#header-meta-information)
* [Page Routing](#page-routing)
* [Redux Store](#redux-store)
* [Localization](#localization)
  * [Language Detection](#language-detection)
  * [Changing Languages](#changing-languages)
* [User Management](#user-management)
  * [Loading User Information](#loading-user-information)
  * [Privacy Policy and Terms of Service](#privacy-policy-and-terms-of-service)
  * [Password Reset](#password-reset)
  * [E-mail Verification](#e-mail-verification)
  * [Roles](#roles)
  * [Social Logins](#social-logins)
    * [Facebook](#facebook)
    * [Github](#github)
    * [Google](#google)
    * [Instagram](#instagram)
    * [LinkedIn](#linkedin)
    * [Twitter](#twitter)
* [Custom API Routes](#custom-api-routes)
* [Custom Database Models](#custom-database-models)
* [Server-Side Caching](#server-side-caching)
* [Opbeat Error Tracking](#opbeat-error-tracking)
* [Additional Environment Variables](#additional-environment-variables)
* [Custom Environment Variables](#custom-environment-variables)

---

## Setup and Installation

Canon is published on NPM, and should be installed just like any other node package. After creating a package.json file (try `npm init`), install Canon like this:

```bash
npm i @datawheel/canon-core
```

Once installed, run the following command to create some initial scaffolding:

```bash
npx canon-setup
```

Now that the necessary files are in place, simply run `npm run dev` to spin up the development server.

If you encounter an error that causes the node server to keep running in the background, the following command should kill the process:

```bash
kill -9 $(ps aux | grep @datawheel/canon-core/bin/server.js | grep -v grep | awk '{print $2}')
```

---

## Deployment

Deploying a site with canon is as easy as these 2 steps:

* `npm run build` to compile the necessary production server and client bundles
* `npm run start` to start an Express server on the default port

---

## Header/Meta Information

All tags inside of the `<head>` of the rendered page are configured using [Helmet](https://github.com/helmetjs/helmet). If a file is present at `app/helmet.js`, the Object it exports will be used as the configuration. This file can use either ES6 or node style exports, but if you import any other dependencies into that file you must use node's `require` syntax.

Here is an example configuration, as seen in this repo's sample app:

```js
export default {
  link: [
    {rel: "icon", href: "/images/favicon.ico?v=2"},
    {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Work+Sans:300,400,500,600,700,900"}
  ],
  meta: [
    {charset: "utf-8"},
    {"http-equiv": "X-UA-Compatible", "content": "IE=edge"},
    {name: "description", content: "Reusable React environment and components for creating visualization engines."},
    {name: "viewport", content: "width=device-width, initial-scale=1"},
    {name: "mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-status-bar-style", content: "black"},
    {name: "apple-mobile-web-app-title", content: "Datawheel Canon"}
  ],
  title: "Datawheel Canonical Design"
};
```
---

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

---

## Redux Store

Default values can be added to the Redux Store by creating a file located at `app/store.js`. This file should export an Object, whose values will be merged with the defaul store. This file can use either ES6 or node style exports, but if you import any other dependencies into that file you must use node's `require` syntax.

Here is an example:

```js
export default {
  countries: ["nausa", "sabra", "aschn"]
};
```

--

## Redux Middleware

Custom middleware can be added to the Redux Store by creating a file located at `app/middleware.js`. This file should export an Array, whose values will be concat with the default middleware. This file can use either ES6 or node style exports, but if you import any other dependencies into that file you must use node's `require` syntax.

Here is an example:

```js
const CustomMiddleware = require('CustomLibrary');
export default [CustomMiddleware];
```

---

## Localization

In order to enable localization for a Canon site, you must first define the available languages as an environment variable:

```sh
export CANON_LANGUAGES="en,es"
```

Next, any component that needs access to localized text needs to be wrapped in the react-i18next `withNamespaces` function:

```jsx
import React, {Component} from "react";
import {Link} from "react-router";
import {withNamespaces} from "react-i18next";

class Nav extends Component {

  render() {

    const {t} = this.props;

    return (
      <nav>
        <Link href="/about">{ t("nav.about") }</Link>
        { t("nav.welcome", {name: "Dave"}) }
      </nav>
    );

  }
}

export default withNamespaces()(Nav);
```

When a component is wrapped with `withNamespaces`, it will have access to a function named `t` inside it's props. This function is what handles fetching the appropriate translation, and also allows us to scrape an entire project to locate every string that needs translation. When you are ready to start populating translations, simply run `npm run locales`.

Canon will search your entire codebase for any component using the `t( )` function. Translations are stored in JSON files in a `locales/` folder in the root directory. In this example, running the script would produce the following file structure:

```
locales/
├── en/
│   ├── [project-name]_old.json
│   └── [project-name].json
└── es/
    ├── [project-name]_old.json
    └── [project-name].json
```

Translations that are in use are stored in a JSON file, while translations that were previously in use (from the last time the script was run) but are no longer in use are stored in the file suffixed `_old`. While running the script, any existing translations will be kept as is, so there is no need to worry about overwriting previous translations.

Since this is our first time running the scraper, both language's translation files will look like this:

```json
{
  "nav": {
    "about": "",
    "welcome": ""
  }
}
```

If you look at your site in this state, now strings will be displayed in the components because their translation values are empty! A filled in translation file would look like this:

```json
{
  "nav": {
    "about": "About",
    "welcome": "Welcome back {{name}}!"
  }
}
```

Notice the second string contains a variable surrounded by two sets of curly brackets. This is the notation for passing variable to translated strings, and is crucial in creating mad-libs style text.

Additionally, to set the default language used in the site on first visit, set the following environment variable (default is `"en"`):

```sh
export CANON_LANGUAGE_DEFAULT="es"
```

### Language Detection

A user's language can be determined in multiple ways. Here is the order of the cascading detection. Once a valid language (one that contains translations in a JSON file) has been detected, the process exits:

1. sub-domain (ie. `https://pt.codelife.com`)
2. `lang` query argument (ie. `https://www.codelife.com?lang=pt`)
3. `language` query argument (ie. `https://www.codelife.com?language=pt`)
4. `locale` query argument (ie. `https://www.codelife.com?locale=pt`)
5. `lng` query argument (ie. `https://www.codelife.com?lng=pt`)

### Changing Languages

In order to change the language of the current page, you must trigger a full browser reload with the new URL. This can be done one of two ways. By using an anchor tag with the `data-refresh` attribute:

```jsx
<a data-refresh="true" href="/?locale=es">Spanish</a>
```

Or in a JavaScript event handler:

```jsx
window.location = "/?locale=es";
```

---


## User Management

By setting the following environment variables:

```sh
export CANON_DB_NAME="XXX"
export CANON_DB_USER="XXX"
export CANON_DB_HOST="XXX"
export CANON_DB_PW="XXX"
export CANON_LOGINS=true
```

Canon will automatically instantiate a "users" table in the specified database to enable full user management. At this point, all that is needed in your application is to use the Login and Signup components exported by Canon:

```jsx
import {Login, SignUp} from "@datawheel/canon-core";
```

These two components can either be used directly with a Route, or as children of other components. They are simple forms that handle all of the authentication and errors. If you would like to change the page the user is redirected to after logging in, you can override the default "redirect" prop:

```jsx
<Login redirect="/profile" />
```

If a `false` value is provided as a redirect, the redirect will be disabled and you must provide you own detection of the `state.auth.user` object in the redux store.

*NOTE*: If also using [social logins](#social-logins), the `CANON_SOCIAL_REDIRECT` environment variable needs to be set in order to change those redirects.

### Loading User Information

Once login/signup forms have been set up, any component that needs access to the currently logged in user needs to dispatch an action to request the information. Ideally, this logic happens in `app/App.jsx` so that anyone can access the user from the redux store:

```jsx
import React, {Component} from "react";
import {connect} from "react-redux";
import {Canon, isAuthenticated} from "@datawheel/canon-core";

class App extends Component {

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {

    // use this auth object (auth.user) to selectively show/hide components
    // based on whether user is logged in or not
    const auth = this.props.auth;
    console.log(auth);

    return (
      <Canon>
        { auth.user ? `Welcome back ${auth.uesr.username}!` : "Who are you!?" }
        { auth.loading ? "Loading..." : this.props.children }
      </Canon>
    );

  }

}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

### Privacy Policy and Terms of Service

In order to force new users to agree to a Privacy Policy and/or Terms of Service when signing up for a new account, you must specify the valid routes as environment variables. If one or both of these routes are set, then a check box will appear in the `<SignUp>` component with the corresponding page links.

```sh
export CANON_LEGAL_PRIVACY="/privacy"
export CANON_LEGAL_TERMS="/terms"
```

### Password Reset

If a user forgets their password, it is common practice to allow sending their e-mail on file a link to reset it. Canon has built-in [Mailgun](https://www.mailgun.com) support, so once you have set up an account for your project through their website, you can enable this ability with the following environment variables (taken from the [Mailgun](https://www.mailgun.com) developer interface):

```sh
export CANON_MAILGUN_API="key-################################"
export CANON_MAILGUN_DOMAIN="###.###.###"
export CANON_MAILGUN_EMAIL="###@###.###"
```

With those variables set, if a user is trying to log in and types an incorrect password, the alert message will contain a link to reset their password. They will receive an e-mail containing a link that directs them to a page at the route `/reset`. This route needs to be hooked up as part of the **app/routes.jsx** file, and needs to contain the `<Reset />` component exported by Canon. For example:

```jsx
import React from "react";
import {Route} from "react-router";
import {Reset} from "@datawheel/canon-core";

const App = () => "Hello World";

export default () => <Route path="/" component={App}>
  <Route path="reset" component={Reset} />
</Route>;
```

If you would like to change the default path of the reset link, use the following environment variable:

```sh
export CANON_RESET_LINK="/my-reset-route"
```

The `<Reset />` component relies on detecting a unique token in the URL (which is sent in the e-mail to the user). If you would like to embed the component into an existing page, you must pass the Router object to the component on render:

```jsx
<Reset router={ this.props.router }/>
```

When sending e-mails, datahweel-canon will use the "name" field of your **package.json** file as the site name in e-mail correspondence (ex. "Sincerely, the [name] team"). If you'd like to use a more human-readable site name, it can be set with the following environment variable:

```sh
export CANON_MAILGUN_NAME="Datawheel Canon"
```

The default contents of the e-mail to be sent is stored [here](https://github.com/Datawheel/canon/blob/master/src/auth/emails/resetPassword.html), and can be overridden using any local HTML file using the following environment variable:

```sh
export CANON_RESET_HTML="path/to/file.html"
```

The path to this file is relative to the current working directory (`process.cwd()`), and the text inside of the file is run through the i18n parser like all of the front-end client facing components. The associated translation tags can be located under the `mailgun` key inside of the `Reset` key.

### E-mail Verification

If you would like your site to require e-mail verification, you can utilize [Mailgun](https://www.mailgun.com) in a way very similar to the [Password Reset](#password-reset) workflow. Set the appropriate [Mailgun](https://www.mailgun.com) environment variables:

```sh
export CANON_MAILGUN_API="key-################################"
export CANON_MAILGUN_DOMAIN="###.###.###"
export CANON_MAILGUN_EMAIL="###@###.###"
```

And then hook up an `/activate` route with the `<Activate />` component:

```jsx
import React from "react";
import {Route} from "react-router";
import {Activate} from "@datawheel/canon-core";

const App = () => "Hello World";

export default () => <Route path="/" component={App}>
  <Route path="activate" component={Activate} />
</Route>;
```

If you would like to change the default path of the activation link, use the following environment variable:

```sh
export CANON_ACTIVATION_LINK="/my-activation-route"
```

This component needs to be viewed while logged in, and contains a button to resend a verification e-mail with a new token. Similar to the `<Reset />` component, if you would like to use the `<Activate />` component inside of a pre-existing route (such as an account profile page), you must pass the Router location to the component:

```jsx
<Activate location={ this.props.location } />
```

Additionally, the component has an optional property to allow it to be hidden on a page. The verification will still register, but the component itself will render `null`:

```jsx
<Activate hidden={ true } location={ this.props.location } />
```

By default, activation e-mails are only sent when clicking the button in the `<Activate />` component. If you would like to send a verification e-mail when a user first signs up, enable the following environment variable:

```sh
export CANON_SIGNUP_ACTIVATION=true
```

When sending e-mails, datahweel-canon will use the "name" field of your **package.json** file as the site name in e-mail correspondence (ex. "Sincerely, the [name] team"). If you'd like to use a more human-readable site name, it can be set with the following environment variable:

```sh
export CANON_MAILGUN_NAME="Datawheel Canon"
```

The default contents of the e-mail to be sent is stored [here](https://github.com/Datawheel/canon/blob/master/src/auth/emails/activation.html), and can be overridden using any local HTML file using the following environment variable:

```sh
export CANON_ACTIVATION_HTML="path/to/file.html"
```

The path to this file is relative to the current working directory (`process.cwd()`), and the text inside of the file is run through the i18n parser like all of the front-end client facing components. The associated translation tags can be located under the `mailgun` key inside of the `Activation` key.

### Roles

Every new user of a Canon site has a default "role" value of `0`. This value is accessible via the user object in the "auth" redux store object. The default roles are as follows:

* `0` User
* `1` Contributor
* `2` Admin

Canon exports a `<UserAdmin />` component that allows for changing these roles. It is a simple table that displays all users and their current role assignments.

### Social Logins

Once the respective social network application has been set up in their developer interface, Canon looks for a corresponding API and SECRET environment variables to enable that login.

*NOTE*: If deploying using Supervisor, environment variables cannot be wrapped in quotation marks.

If you would like to change the page the user is redirected to after logging in using a social network, an environment variable is needed:

```sh
export CANON_SOCIAL_REDIRECT="/profile"
```

#### Facebook
1. [https://developers.facebook.com](https://developers.facebook.com)
2. Once logged in, hover over "My Apps" in the top right of the page and click "Add a New App"
3. Set up "Facebook Login" as the product.
4. Choose "Web" as the Platform.
5. Skip the Quickstart guide and go directly to "Settings" in the sidebar. Your settings should look like the following image, with at the very least `http://localhost:3300/auth/facebook/callback` in the Valid OAuth redirect URIs. Once there is a production URL, you will need to add that callback URL here along with localhost. ![](https://github.com/datawheel/canon/raw/master/docs/facebook-oauth.png)
6. Go to "Settings" > "Advanced" and turn on "Allow API Access to App Settings" (at the time of writing, it was the last toggle in the "Security" panel)
7. Go to "Settings" > "Basic" and copy the App ID and App Secret to your environment as the following variables:
```sh
export CANON_FACEBOOK_API="###############"
export CANON_FACEBOOK_SECRET="##############################"
```

#### Github
1. [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill out the form and set "Authorization callback URL" to `https://localhost/auth/github/callback`
3. Click register application
4. From the next screen copy the Client ID and Client Secret values to:
```
export CANON_GITHUB_API="###############"
export CANON_GITHUB_SECRET="##############################"
```

#### Google
1. [https://console.developers.google.com/](https://console.developers.google.com/)
2. Once logged in, enable the "Google+ API"
3. Go to the "Credentials" tab inside the "Google+ API" settings view and click "Create Credentials" and create OAuth client credentials
4. Click the name of the credentials you created in the previous step
5. For "Authorized JavaScript origins" add `https://localhost`
6. For "Authorized Redirect URIs" add `https://localhost/auth/google/callback`
7. Set the Client ID (CANON_GOOGLE_API) and Client Secret (CANON_GOOGLE_SECRET) values in your environment:
```sh
export CANON_GOOGLE_API="###############"
export CANON_GOOGLE_SECRET="##############################"
```

#### Instagram
1. [https://www.instagram.com/developer/](https://www.instagram.com/developer/)
2. Once logged in, click the "Manage Clients" button in the top navigation, then click the green "Register a New Client" button.
3. Fill out the meta information about your project, but specifically set the "Valid redirect URIs" to `http://localhost:3300/auth/instagram/callback`. Once there is a production URL, you will need to add that callback URL here along with localhost.
4. Click the green "Register" button when done.
5. You should be returned to the page listing all of your projects. Click "Manage" on the current project and copy the Client ID and Client Secret to your environment as the following variables:
```sh
export CANON_INSTAGRAM_API="###############"
export CANON_INSTAGRAM_SECRET="##############################"
```

#### LinkedIn
1. [https://www.linkedin.com/developer/apps/new](https://www.linkedin.com/developer/apps/new)
2. Fill out the form (LinkedIn requires that you add a square image of at least 80x80 px)
3. Click "Submit"
4. Under the OAuth 2.0 section for "Authorized Redirect URLs" enter `https://localhost/auth/linkedin/callback`
5. Click "Add" then click "Update"
6. From the same application settings screen, copy the Client ID and Client Secret values to:
```
export CANON_LINKEDIN_API="###############"
export CANON_LINKEDIN_SECRET="##############################"
```

#### Twitter
1. [https://apps.twitter.com](https://apps.twitter.com)
2. Once logged in, click the "Create New App" button on the top right of the page.
3. Fill out the meta information about your project, but specifically set the "Callback URL" to `http://localhost:3300/auth/twitter/callback`.
4. Go to the "Key and Access Tokens" tab and copy the Consumer Key (API Key) and Consumer Secret (API Secret) to your environment as the following variables:
```sh
export CANON_TWITTER_API="###############"
export CANON_TWITTER_SECRET="##############################"
```
5. Click the "Permissions" tab then at the bottom under "Additional Permissions" check the box that reads "Request email addresses from users" (if you would like to request e-mail addresses from users).
---

## Custom API Routes

If you app requires custom API routes, Canon will import any files located in a `api/` directory and attach them to the current Express instance. For example, a file located at `api/simpleRoute.js`:

```js
module.exports = function(app) {

  app.get("/api/simple", (req, res) => {

    res.json({simple: true}).end();

  });

};
```

*NOTE*: Custom API routes are written using Node module syntax, not ES6/JSX.

If you'd like to interact with the database in a route, the Express app contains the Sequelize instance as part of it's settings:

```js
module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/user", (req, res) => {

    db.users.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
```

Additionally, if you would like certain routes to only be reachable if a user is logged in, you can use this simple middleware to reject users that are not logged in:

```js
const authRoute = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("you are not logged in...");
};

module.exports = function(app) {

  app.get("/api/authenticated", authRoute, (req, res) => {

    res.status(202).send("you are logged in!").end();

  });

};
```

---

## Custom Database Models

If you have custom database models that you would like to interact with in API routes, Canon will import any file in a `db/` folder and set up all the associations Sequelize requires. For example, a `db/testTable.js` would look like this:

```js
module.exports = function(sequelize, db) {

  return sequelize.define("testTable",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      title: db.STRING,
      favorite: {
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }
  );

};
```

*NOTE*: Custom database models are written using Node module syntax, not ES6/JSX.

---

## Server-Side Caching

Some projects benefit by creating a server-side data cache to be used in API routes (for example, metadata about cube dimensions). Canon imports all files present in the top level `cache/` directory, and stores their return contents in `app.settings.cache` based on their filename. For example, to store the results of an API request in the cache, you could create the following file at `cache/majors.js`:

```js
const axios = require("axios");

module.exports = function() {

  return axios.get("https://api.datausa.io/attrs/cip/")
    .then(d => d.data);

};
```

The results of this promise can then be used in an API route:

```js
module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/cache/majors", (req, res) => {

    res.json(cache.majors).end();

  });

};
```

---

## Opbeat Error Tracking

If you would like to enable error tracking using Opbeat, add these 3 environment variables after initializing the app in the Opbeat online interface:

```sh
export CANON_OPBEAT_APP=your-opbeat-app-id
export CANON_OPBEAT_ORG=your-opbeat-organization-id
export CANON_OPBEAT_TOKEN=your-opbeat-secret-token
```

*NOTE*: Opbeat runs as express middleware, and will only track in production environments.

---

## Additional Environment Variables

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
|`CANON_GOOGLE_ANALYTICS`|The unique Google Analytics ID for the project (ex. `"UA-########-#"`).|`undefined`|
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

## Custom Environment Variables

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
