# Canon CMS
Content Management System for Canon sites.

## Table of Contents
* [Why?](#why)
* [Setup and Installation](#setup-and-installation)
* [Enabling Image Support](#enabling-image-support)
* [Rendering a Profile](#rendering-a-profile)
* [Overview and Terminology](#overview-and-terminology)
* [Environment Variables](#environment-variables)
* [Sections](#sections)
* [Search](#search)
* [Advanced Visualization Techniques](#advanced-visualization-techniques)
* [Frequently Asked Questions](#frequently-asked-questions)
* [Release Notes](#release-notes)
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

#### 5) Configure Redux

The CMS state state is managed from the site-wide redux state. In `app/reducers/index.js`, import the reducer function and assign it to the `cms` key:

```js
import {cmsReducer} from "@datawheel/canon-cms";

export default {
  cms: cmsReducer
};
```

#### 6) Start your dev server
```sh
npm run dev
```

#### 7) Navigate to the CMS panel

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

#### 6) Accessing Images

Images will automatically be rendered in the "Hero" section of a profile, which is automatically created upon profile creation. However, if you need direct access to the hosted images, they are reachable via:

```
/api/image?slug=<slug>&id=<id>
```

Images default to splash size, but you may set `&size=thumb` for a thumbnail. To retrieve metadata about the image rather than the image itself, add `&type=json` to the params.

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

## Sections

Sections are the chunks of content you will use to build a page. Each section contains [metadata](#section-metadata) fields, and various [content entities](#content-entities).

### Section metadata
Used to customize the way the section behaves. Metadata fields include:

#### Title
The name of the section. This will be used by the heading tag on the profile, and in the admin panel navigation.

#### Slug
An ID for referencing the section. This is used to link directly to a section via scrolling anchor links, and is used in the construction of share links. Each section on a page *must* have a unique ID.

#### Visibility
The truthiness of this value will be used to determine whether or not the section appears on a given profile.

---

#### Layouts
Change the way the section looks and behaves. Out of the box, the following section layouts are included:

##### Hero layout
The hero section is typically the first thing a user sees upon visiting a profile. It fills up most of the screen, displays the title in large type, and features an image or set of images in the background. If the section does not include a visualization, the text will be centered. If the section *does* include a visualization, the layout will switch to two columns, with the visualization on the right.

The first section in each profile is automatically assigned this layout, and *only* the first section in a profile can use this layout.

##### Default layout
The default layout uses most of the available screen real estate for the visuals, with descriptive text and controls grouped into a sidebar. If the section includes multiple visualizations, they will be arranged into rows or columns, depending on the size of the screen.

This layout is ideal for 1-2 visualizations. If no visualizations are included, the text content will appear in a single column.

##### Grouping layout
A grouping section is used to group related sections together.

Functionally, it creates hierarchy by nesting each following section, until the next grouping section (which in turn, starts a new grouping). In addition, it acts as a sign post for the section, prominently displaying its title.

##### Info card layout
Used to display a summary of data with a small footprint, the info card is one of the most situational layouts. Since the layout was designed for primarily text content, it's best to use only a single graphic, or simple visualization such as a **gasp** pie chart.

Any adjacent info cards will be automatically grouped together into columns.

##### Multicolumn layout
The multicolumn layout takes any content you throw at it, and balances it into columns to the best of its ability. It uses [css multi-column layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Columns), which has excellent browser support but can get funky when there aren't enough paragraphs to split evenly.

This layout is useful for sections with a lot of text and 0-1 visualizations, such as the about section that typically follows the hero section in our DataCountry sites.

##### Single column layout
On its own, the single column layout is a simple tube of content. However, like the info card section, adjacent single columns will be automatically grouped together into a grid.

Use this layout when you want multiple, similar, evenly spaced columns, with simple visuals at the bottom.

##### Tabs layout
At first, this layout may appear to be similar to the [default](#default-layout) layout. However, each visual in the section will become its own *panel*, which can be accessed via the automatically generated button group in the sidebar.

This layout is ideal for displaying similar or related information in one section, while showing one visual at a time.

🔥**Pro tip**: additional tabs section customization can be achieved via the visualization configuration:
1. label the corresponding tab's button text (`tab: "custom button text"`)
2. specify an array of selectors for the corresponding tab (`selectors: ["selectorName1", "selectorName2"]`).

---

#### Positioning
By default, each section will simply appear below the previous section as the user scrolls. In addition, there are two highly situation alternate behaviors:

##### Sticky positioning
This takes advantage of the `position: sticky` css property — or in the case of Internet Explorer, dirty hacks — and sticks to the top of the screen until the user scrolls to the bottom of the grouping it appears in. This is typically used to keep selectors which effect an entire section grouping visible as you scroll through it.

These sections cannot use certain features of standard sections, due to their added complexity and their need to be space efficient.

##### Modal positioning
The section will no longer render unless it is called via a function elsewhere. Modals can be assigned any of the standard layouts except for grouping.

For more information, see [Opening a modal window](#opening-a-modal-window)

---

### Content entities
Used to add, edit, and remove content.

#### Subtitles
Short bits of text that appear underneath the section title for added clarification.

#### Stats
Useful for emphasizing bits and pieces of data, stats are made up of the following:

1. **Label**: appears before the number, concisely explaining what it represents.
2. **Value**: the big number itself
3. **Subtitle**: appears after/below the number, used for clarification

🔥**Pro tip**: Multiple stats with the same label will be grouped together into columns, and their label will only be displayed once.

#### Paragraphs
Text rendered into paragraph tags.

#### Visualizations
Primarily, visualizations utilize [d3plus](http://d3plus.org/). However, we've also added a few custom visualization types:

##### Percentage bar
Renders a list of bars, each indicating a share.

🔥**Pro tip**: custom config settings for this option include:
- `cutoff` (integer; number of bars to show before hiding the rest behind a button)
- `cutoffText` (string; text to print in a paragraph preceding the *show more* button)
- `showText` & `hideText` (string; show/hide button label text)

##### Table
Renders data in a [react-table](https://github.com/tannerlinsley/react-table/tree/v6) table. All react-table props are available.

🔥**Pro tip**: we've combined react-table's infinite nesting capability with more accessible table header markup and consistent styles. The config syntax looks like: `columns: ["col1", "col2"]` for a flat array of columns, or `columns: [["header grouping label", ["col1", "col2"]]]` from an array of grouped/named columns. If an item in the array is a *string*, it will simply be converted to a column via that string. If an item in the array is an *array*, we're assuming the first item in the nested array is a string (the name of the column group), followed by an array — which can in turn be an array which contains strings, or an array with a string and an array, and so on.

🔥**Pro tip**: You can also pass `headerFormat(key)` and `columnFormat(key, val)` to the config.

##### Graphic
Renders an image, optionally on top of a [stat](#stats). The config looks like:
```
config: {
  imageURL: "link/to.image",
  label: "stat label", // optional
  value: "stat value", // optional
  subtitle: "stat subtitle" // optional
}
```

🔥**Pro tip**: Multiple graphic visualizations will be automatically grouped together into a grid — but only in the [default](default-layout) and [grouping](grouping-layout) section layouts.

---

## Search

The CMS is used to create Profiles based on Dimensions, such as "Geography" or "Industry". The individual entities that make up these dimensions (such as *Massachusetts* or *Metalworkers*) are referred to as Members. These members are what make up the slugs/ids in URLS; when visiting `/geo/massachusetts`, `geo` is the profile/dimension slug and `massachusetts` is the member.

These members can be viewed and edited in the in the MetaData section of the CMS. However, they can also be searched via an API endpoint, which can be useful for setting up a search feature on your site. The API endpoint is:

```
/api/search
```

Arguments are provided by url paramaters:

|parameter|description|
|---|---|
|`q`|A string query which uses the SQL `LIKE` operator to search the `name` and `keywords` of the member|
|`dimension`|An exact-match string to filter results to members in the provided dimension|
|`levels`|A comma-separated list of levels to filter results to members by the provided levels|
|`limit`|A number, passed through to SQL `LIMIT` to limit results|
|`id`|Exact match `id` lookup. Keep in mind that a member `id` is not necessarily unique and may require a `dimension` specification|

Example query:

```
/api/search?q=mass&dimension=Geography
```

---

## Advanced Visualization Techniques

For complex pages, you may need to communicate between visualizations, or customize other behaviors. There are a few potential use cases here:

### Interacting between visualizations

You may want an event in one visualization to have an effect on another visualization. For example, if you have a Treemap of industries, perhaps you want to be able to click "Cars" in one viz, and have a secondary viz respond to focus in on cars.

For this reason, the `setVariables` function has been added to Visualizations. This function allows you access to the `variables` object that the CMS uses to swap variables on the page. In order to achieve the example above, you could set your secondary viz to make use of a variable called `variables.secondaryId`. Then, in the primary viz, you could set the following code in your viz configuration:

```
 "on":
    {
      "click": d => {
        setVariables({secondaryId: d.id});
      }
    }
```

Thus, when you click on a section of the primary viz treemap, it calls `setVariables`, sets the `secondaryId`, and the page will re-render to update the secondary viz with the appropriate id (in the above example, the id for Cars).


### Modifying Page State

Keep in mind that the `setVariables` function accesses the main `variables` object that the entire page has access to. This means ANY entity on the page that makes use of variables is able to listen for changes to this object.

A potential use case for this may be for an entire viz, stat, or section to be shown or hidden based on a click action inside a viz. Remember, each entity in the CMS has an `allowed` property, a variable whose truthiness determines whether to show this entity or not. If you want to control the visibility of an element, set its `allowed` property to a variable that you intend to override later with a click action. To expand the example above:

```
 "on":
    {
      "click": d => {
        setVariables({showSecondaryViz: true, secondaryId: d.id});
      }
    }
```

In this example, you would set the `allowed` property of your second viz to `showSecondaryViz`, which would begin as false (hidden). The click action in your primary viz would set that variable to true (showing the viz) and then setting its `secondaryId` (so the new viz focuses on the desired element).

### Opening a modal window

Alternatively, you may want to click an element in a viz and have something open a modal popover window. Profile sections have a "Positioning" property, which may be set to Default, Sticky, or Modal. If you want a section to be eligible for opening inside a modal popover, set its positioning to Modal, and be sure to remember its slug. This will hide it from the normal rendering of a profile page.

Then, in a viz, you may call the function `openModal(slug)` to embed the section with the provided slug in a popover on the page.

```
 "on":
    {
      "click": d => {
        openModal("myModalSlug");
      }
    }
```

Keep in mind that you may combine the two advanced functions! If your planned modal relies on a secondary ID, you could set something like:

```
 "on":
    {
      "click": d => {
        setVariables({idForMyModal: d.id});
        openModal("myModalSlug");
      }
    }
```

You are then welcome, in the `myModalSlug` section, to make use of `idForMyModal` and trust that it will be set when the modal opens.

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

## Release Notes

Here is a list of Minor CMS versions and their release notes:

- [canon-cms@0.2.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.2.0)
- [canon-cms@0.3.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.3.0)
- [canon-cms@0.4.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.4.0)
- [canon-cms@0.5.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.5.0)
- [canon-cms@0.6.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.6.0)
- [canon-cms@0.7.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.7.0)
- [canon-cms@0.8.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.8.0)
- [canon-cms@0.9.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.9.0)
- [canon-cms@0.10.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.10.0)
- [canon-cms@0.11.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.11.0)

___

## Migration

For upgrading to new versions, there are currently several migration scripts:

1) `npx canon-cms-migrate-legacy` (for DataUSA)
2) `npx canon-cms-migrate-0.1` (for CDC or other 0.1 CMS users)
3) `npx canon-cms-migrate-0.6` (for 0.6 CMS users)
4) `npx canon-cms-migrate-0.7` (for 0.7 CMS users)
5) `npx canon-cms-migrate-0.8` (for 0.8 CMS users)
6) `npx canon-cms-migrate-0.9` (for 0.9 CMS users, for upgrade to 0.11 ONLY)

**Note:** Canon CMS Version 0.10.0 did **NOT** require a database migration, so the `0.9` script will output a `0.11` database.

### Instructions

The name of the script represents the version you wish to migrate **FROM**.  So, to upgrade a DB from 0.6 to 0.7, one would use `npx canon-cms-migrate-0.6`.  Currently both `legacy` and `0.1` upgrade directly to `0.6`.  From here on out, versions will upgrade **one dot version at a time** (exception: 0.9 to 0.11).

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
