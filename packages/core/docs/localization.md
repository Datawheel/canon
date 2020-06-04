# @datawheel/canon-core

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
