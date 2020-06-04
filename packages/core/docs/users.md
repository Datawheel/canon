# @datawheel/canon-passport

## Contents
* [User Management](user-management.md)
  * [Loading User Information](loading-user-information.md)
  * [Privacy Policy and Terms of Service](privacy-policy-and-terms-of-service.md)
  * [Password Reset](password-reset.md)
  * [E-mail Verification](e-mail-verification.md)
  * [Roles](roles.md)
  * [Social Logins](social-logins.md)
    * [Facebook](facebook.md)
    * [Github](github.md)
    * [Google](google.md)
    * [Instagram](instagram.md)
    * [LinkedIn](linkedin.md)
    * [Twitter](twitter.md)

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
<Reset router={ this.props.router } />
```

By default, users are redirected to `/login` after a successful password reset. This can also be changed with a prop:

```jsx
<Reset redirect="/en/login" router={ this.props.router } />
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
