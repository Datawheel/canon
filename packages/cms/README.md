# Canon CMS
Content Management System for Canon sites.

![](https://github.com/datawheel/canon/raw/master/docs/balls.png)

#### Contents
* [Setup and Installation](#setup-and-installation)
* [Rendering a Profile](#rendering-a-profile)
* [Environment Variables](#environment-variables)

---

## Setup and Installation

Coming "Soon" by @jhmullen :grimacing:

---

## Rendering a Profile

The CMS exports a `Profile` component that can be directly mounted to a Route. The only requirement is that you use `pslug` and `pid` for the profile's slug and id properties:

```jsx
import {Profile} from "@datawheel/canon-cms";
...
<Route path="/profile/:pslug/:pid" component={Profile} />
```

---

## Environment Variables

|variable|description|default|
|---|---|---|
|`CANON_CMS_ENABLE`|Setting this env var to `true` allows access to the cms in production builds.|`false`|
