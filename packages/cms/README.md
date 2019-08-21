# Canon CMS
Content Management System for Canon sites.

![](https://github.com/datawheel/canon/raw/master/docs/balls.png)

#### Contents
* [Setup and Installation](#setup-and-installation)
* [Rendering a Profile](#rendering-a-profile)
* [Environment Variables](#environment-variables)
* [Frequently Asked Questions](#frequently-asked-questions)
* [Migration](#migration)

---

## Setup and Installation

Coming "Soon" by @jhmullen :grimacing:

```sh
export CANON_CMS_CUBES=https://tesseract-url.com/cubes
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

## Frequently Asked Questions

### What is the structure of the JavaScipt _Object_ that a visualization returns?

The visualizations are powered by [D3plus](http://d3plus.org/), a JavaScript library also made by Datawheel that simplifies drawing visualizations using D3 by providing many helpful defaults. To get started, you always need to define at least the following 3 things:

1. **data** - without data, no visualization can be drawn! To provide data, set the `data` key inside of the returned _Object_ to either a _String_ URL or an _Array_ of data objects. You can also provide an optional callback function for URLs as the `dataFormat` key, which will allow you to transform the loaded data in any way necessary for the visualization (like calculating a "share" percentage based on the total data returned).

2. **type** - you also need to defined what type of visualization to draw, such as a BarChart or a LinePlot. You can provide any D3plus visualziation class name as a _String_ to the `type` key of the return Object, as well as a few custom HTML based visualizations that come packages with the CMS (like `"Table"` and `"PercentageBar"`). Check out [the code](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/Viz/Viz.jsx#L14) to see the most current list of exports, as well as reference the [d3plus docs](http://d3plus.org/docs/).

3. **visualization configuration** - once the CMS knows the data to use and which visualization to render, you need to tell it a little bit about your data. For example, if creating a Bar Chart of salaries over time, you need to tell which keys in your data objects to use for each axis. Each visualization has slightly different requirements (like `{x: "Salary", y: "Year"}` in this case), and the d3plus [examples](http://d3plus.org/examples/) is probably the best place to familiarize yourself wit this syntax.

One thing to note about d3plus configuration is that any setting can be set in one of two ways: as a method of the instantiated class like `.data(myDataURL)` as seen in some examples, or as a large configuration option (like `.config({data: myDataURL})`). The CMS utilizes the second method of creating custom configuration objects.

### How can I format the data for a visualization?

The config _Object_ that is returned for any visualization contains special additional keys that pertain to formatting data loaded from a URL. For example, if you provide a URL to the `data` key, you can provide a callback function to the `dataFormat` key that will be provided the response data and is expected to return the final data for the visualization and associated data table. This is helpful for doing things like calculating a share percentage:

```js
data: "your-data-url.com",
dataFormat: resp => {
  const data = resp.data;
  const total = sum(data, d => d.quantity);
  data.forEach(d => {
    d.share = d.quantity / total;
  });
  return data;
}
```

This callback functionality works with any method that loads data from a URL, such as `topojson` and `topojsonFormat`.

### How do I add control toggles to a section?

Control toggles are called "selectors" in the CMS, and you create them in the right-hand toolbox using any previously defined generator variables. Similar to generators, the current value of a selector is accessibly in text using double square brackets to surround the id of the selector. For example, if you create a selector with the ID of `year-select`, you could reference the current value in any text (whether a decription or a visualization config) as `[[year-select]]`.

Please note that this only provides the key name of the variable that is the currently selected value, and not the value of the variable itself. So for example, if you then wanted to display the currently selected profile's value, you would write `{{[[year-select]]}}` in a text editor, or `variables["[[year-select]]"]` in a visualization editor.

When using multi-select selectors, the currently selected values will be provided separated by commas (ie. `varName1,varName4`).

Selector values can be referenced anywhere through the site's contents, but if you wish to have a selector be displayed to the user, you must also attach it to a specific section. This is done in the "Selector activation" panel of a section, and you simply press the small plus "+" button to add it to that section.

### How can I preview a different profile in the CMS?

At the top of every section editor in the CMS is the "Dimensions" panel. This panel lets you change which dimension is currently being displayed as the values for all of the generators and text. Simply use the search box in that panel to find a different profile dimension to preview!

___

## Migration

For upgrading to new versions, there are currently three migration scripts:

1) `npx canon-cms-migrate-legacy` (for DataUSA)
2) `npx canon-cms-migrate-0.1` (for CDC or other 0.1 CMS users)
3) `npx canon-cms-migrate-0.6` (for 0.6 CMS users)

### Instructions

The name of the script represents the version you wish to migrate **FROM**.  So, to upgrade a DB from 0.6 to 0.7, one would use `npx canon-cms-migrate-0.6`.  Currently both `legacy` and `0.1` upgrade directly to `0.6`.  From here on out, versions will upgrade **one dot version at a time**.

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
