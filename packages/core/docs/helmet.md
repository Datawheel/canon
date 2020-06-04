# @datawheel/canon-core

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
