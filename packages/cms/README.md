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

```sh
export CANON_CMS_CUBES=https://data-dev.stat.ee/cubes
```

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

---

## Migration

For upgrading to new versions, there are currently three migration scripts:

1) `npm run migrate-legacy` (for DataUSA) 
2) `npm run migrate-0.1` (for CDC or other 0.1 CMS users)
3) `npm run migrate-0.6` (for 0.6 CMS users)

### Instructions

The name of the script represents the version you wish to migrate **FROM**.  So, to upgrade a DB from 0.6 to 0.7, one would use `npm run migrate-0.6`.  Currently both `legacy` and `0.1` upgrade directly to `0.6`.  From here on out, versions will upgrade **one dot version at a time**.

It is necessary that users spin up an entire new database for any CMS migration.

The user need configure two sets of environment variables, `OLD` and `NEW`.

```
CANON_CONST_MIGRATION_OLD_DB_NAME
CANON_CONST_MIGRATION_OLD_DB_USER
CANON_CONST_MIGRATION_OLD_DB_PW 
CANON_CONST_MIGRATION_OLD_DB_HOST

CANON_CONST_MIGRATION_NEW_DB_NAME
CANON_CONST_MIGRATION_NEW_DB_USER
CANON_CONST_MIGRATION_NEW_DB_PW
CANON_CONST_MIGRATION_NEW_DB_HOST
```

These variables represent the old db you are migration **from** and the new db you are migrating **to**.  The new db will be **wiped every time** you run the script - the idea here is that you are building a new db from scratch.

🔥 WHATEVER DB YOU CONFIGURE AS **NEW** WILL BE COMPLETELY DESTROYED AND BUILT FROM SCRATCH 🔥
🔥 DO NOT SET `CANON_CONST_MIGRATION_NEW_DB_*` TO A CURRENTLY IMPORTANT DB🔥

After the migration is done, you can switch your dev environment to the new DB for testing, and eventually switch it to prod.
