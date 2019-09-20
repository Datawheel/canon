# Canon CMS
Content Management System for Canon sites.

## Table of Contents
* [Why?](#why)
* [Setup and Installation](#setup-and-installation)
* [Enabling Image Support](#enabling-image-support)
* [Rendering a Profile](#rendering-a-profile)
* [Overview and Terminology](#overview-and-terminology)
* [Environment Variables](#environment-variables)
* [Frequently Asked Questions](#frequently-asked-questions)
* [Migration](#migration)

---

## Why?

Datawheel makes sites with lots of profiles, which requires lots of templating support. Content creators and translators need to be able to author and update page templates easily. Canon CMS allows users to:

- Hit an endpoint to receive a data payload
- Turn that payload into variables using javascript
- Write prose that substitutes those variables
- Apply formatters that make the variables human-readable
- Compile these sections into a page that handles drop-downs, visualizations, and other complexities without bothering DevOps

---

## Setup and Installation

Canon CMS is a package for `canon`. These instructions assume you have installed the latest version of `canon`.

#### 1) Install the package using npm

`npm i @datawheel/canon-cms`

#### 2) Configure `canon` vars 

There are a number of [canon-core environment variables](https://github.com/Datawheel/canon#additional-environment-variables) that `canon-cms` relies on. Ensure that the the following env vars are set.

Canon CMS relies on `canon` needs, so be sure your `CANON_API` is set:
```sh
export CANON_API=http://localhost:3300
```

CMS content that you author can be translated into other languages. Set `CANON_LANGUAGE_DEFAULT` to your locale. If you plan to translate your content, set `CANON_LANGUAGES` to a comma separated list of languages you wish to use. Note that while `CANON_LANGUAGES` can be changed later, `CANON_LANGUAGE_DEFAULT` cannot, so remember to set it before starting!
```sh
export CANON_LANGUAGE_DEFAULT=en
export CANON_LANGUAGES=pt,es,ru,et
```

Canon CMS makes use of `canon`-level db credentials to store its content. Currently Canon CMS only supports Postgres.
```sh
export CANON_DB_USER=dbuser
export CANON_DB_NAME=dbname
export CANON_DB_HOST=dbhost
```

#### 3) Configure `canon-cms` vars

Canon CMS requires a `canon-cms` specific env var for the current location of your mondrian or tesseract installation.
```sh
export CANON_CMS_CUBES=https://tesseract-url.com/
```

By default, the CMS will only be enabled on development environments. If you wish to enable the CMS on production, see the `CANON_CMS_ENABLE` in [Environment Variables](#environment-variables) below.

In total, your env vars should now look like this:
```sh
export CANON_API=http://localhost:3300
export CANON_LANGUAGE_DEFAULT=en
export CANON_LANGUAGES=pt,es,ru,et
export CANON_DB_USER=dbuser
export CANON_DB_NAME=dbname
export CANON_DB_HOST=dbhost
export CANON_CMS_CUBES=https://tesseract-url.com/
```

#### 4) Add the Builder Component to a route
```jsx
import {Builder} from "@datawheel/canon-cms";

...

<Route path="/cms" component={Builder} />
```

#### 5) Start your dev server 
```sh
npm run dev
```

#### 6) Navigate to the CMS panel

`http://localhost:3300/cms`

---

## Enabling Image Support

Canon CMS includes the ability to assign each member of a cube (Such as *Massachusetts*, or *Metalworkers*) an acceptably licensed photo from flickr. In order to enable this, a series of steps must be taken to configure both the flickr authentication and the Google Cloud Storage for image hosting.  Contact the Admin who is in charge of this project's Google Cloud Project, or get permissions to do the following:

#### 1) Create a bucket

In the Storage section of Google Cloud Projects, create a bucket and give it a name. Set the var `CANON_CONST_STORAGE_BUCKET` to the name you provided.
```sh
export CANON_CONST_STORAGE_BUCKET=your_bucketname
```

#### 2) Create and Download a JSON Token

Follow the instructions [here](https://cloud.google.com/docs/authentication/getting-started) to create a JSON token with "Storage -> Storage Object Admin" permissions. 

Save the JSON token to disk and set its permissions to `644`.
```sh
chmod 644 /path/to/token.json
```

Configure the `GOOGLE_APPLICATION_CREDENTIALS` env var to the token's path.
```sh
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/token.json"
```

#### 3) Set your Flickr API key

```sh
export FLICKR_API_KEY=your_api_key
```

#### 4) Set Image Sizes (optional)

By default, Canon CMS will resize your splash and thumb images to a width of 1400 and 200, respectively. To override these sizes you may set the following env vars:

```sh
export CANON_CONST_IMAGE_SPLASH_SIZE=1400
export CANON_CONST_IMAGE_THUMB_SIZE=200
```

#### 5) Follow the instructions in the "Meta Editor" Tab of the CMS

Every member for every profile is listed under the Meta Editor tab. Click "+ Add Image" in one of the rows and follow the intructions to upload an image via a flickr share link.

--- 

## Rendering a Profile

The CMS exports a `Profile` component that can be directly mounted to a Route. The only requirement is that you use `pslug` and `pid` for the profile's slug and id properties:

```jsx
import {Profile} from "@datawheel/canon-cms";
...
<Route path="/profile/:pslug/:pid" component={Profile} />
```

---

## Overview and Terminology

A Canon site often takes the form of DataCountry.io, and is made of **Profiles**. Canon CMS provides a way of creating and updating these profiles. Here are a few terms:

### CMS Elements

- **Profile**: A "page" on DataCountry.io. This could be something like "Massachusetts" or "Metalworkers". These are linked to a **Dimension** in a Tesseract or Mondrian cube.

- **Section**: A vertically stacked "unit" of a Profile page. As you scroll down a DataCountry profile, you will see **Sections** - individual blocks of prose and vizes - that represent some data (such as "Wage by Gender")

- **Generator**: A CMS Entity which hits a provided API and stores the response in a variable called `resp`. Expects you to write javascript that returns an object full of key-value pairs. These KV pairs will be combined with other generators into a giant `variables` object that represents your lookup table for your mad-libs prose.

- **Materializer**: Similar to a Generator, but with no API call. Materializers are guaranteed to be run *after* Generators, and in a strict order. Any materializer can make use of variables generated before it. Useful for datacalls that need to be combined, or for arbitrary variables (like CMS rules or about text)

- **Formatter**: A formatter is a javascript function that will be applied to a variable. It receives one input, **n**, and returns a String. For example, take a javascript integer and add commas to make it a human-readable number.

### Cube / Data Elements

- **Cube**: A queryable data store. For the purposes of this README, think of it as a database you can make API requests to.

- **Dimension**: Any given Profile in the CMS must be linked to one or more dimensions. Examples include "Geography," "University," or "CIP" (Industry). You could have a `geo` profile, which is linked to the "Geography" dimension, whose members are things like Massachusetts or New York.

---

## Environment Variables

|variable|description|default|
|---|---|---|
|`CANON_CMS_CUBES`|Path to the mondrian or tesseract|`undefined (required)`|
|`CANON_CMS_ENABLE`|Setting this env var to `true` allows access to the cms in production builds.|`false`|
|`CANON_CMS_LOGGING`|Enable verbose logging in console.|`false`|
|`FLICKR_API_KEY`|Used to configure Flickr Authentication|`undefined`|
|`GOOGLE_APPLICATION_CREDENTIALS`|Path to JSON token file for Cloud Storage|`undefined`|
|`CANON_CONST_STORAGE_BUCKET`|Name of Google Cloud Storage Bucket|`undefined`|
|`CANON_CONST_IMAGE_SPLASH_SIZE`|Splash width to resize flickr images|1400|
|`CANON_CONST_IMAGE_THUMB_SIZE`|Thumb width to resize flickr images|200|

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
4) `npx canon-cms-migrate-0.7` (for 0.7 CMS users)

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
