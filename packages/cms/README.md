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
* [Custom Sections](#custom-sections)
* [Search](#search)
* [Advanced Generator Techniques](#advanced-generator-techniques)
* [Advanced Visualization Techniques](#advanced-visualization-techniques)
* [Advanced Selector Techniques](#advanced-selector-techniques)
* [Authentication](#authentication)
* [Profile Caching](#profile-caching)
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

#### 2) Configure the database models in the `canon.js` file

Canon CMS uses the `canon`-level user model to handle authentication and edit permissions, in addition to some other models to store the content. You must configure these modules manually on the application's `canon.js` file:

```js
module.exports = {
  ...,
  db: [{
    connection: process.env.CANON_DB_CONNECTION_STRING,
    tables: [
      require("@datawheel/canon-core/models"),
      require("@datawheel/canon-cms/models")
    )
  }]
  ...,
};
```

You can then set the connection parameters in the environment variables, using the keys you set in the code. Check the documentation for canon-core's DB configuration for more info on how the setup works.

Please note Canon CMS currently only supports Postgres.

#### 3) Configure `canon` vars

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

#### 4) Configure `canon-cms` vars

Canon CMS requires a `canon-cms` specific env var for the current location of your mondrian or tesseract installation.
```sh
export CANON_CMS_CUBES=https://tesseract-url.com/
```

By default, the CMS will only be enabled on development environments. If you wish to enable the CMS on production, see the `CANON_CMS_ENABLE` in [Environment Variables](#environment-variables) below.

In summary, your env vars should now look like this:
```sh
export CANON_API=http://localhost:3300
export CANON_LANGUAGE_DEFAULT=en
export CANON_LANGUAGES=pt,es,ru,et
export CANON_DB_CONNECTION_STRING=postgresql://dbuser:dbpass@dbhost:dbport/dbname
export CANON_CMS_CUBES=https://tesseract-url.com/
```

Remember the `CANON_DB_CONNECTION_STRING` is up to you, depending on how did you configure the DB on the `canon.js` file.

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

The CMS exports a `Profile` component that can be directly mounted to a Route. The only requirement is that you use `slug` and `id` for the profile's slug and id properties:

```jsx
import {Profile} from "@datawheel/canon-cms";
...
<Route path="/profile/:slug/:id" component={Profile} />
```

To add support for bilateral profiles, add a second route after the main route, using numbered slug id pairs:

```jsx
import {Profile} from "@datawheel/canon-cms";
...
<Route path="/profile/:slug/:id" component={Profile} />
<Route path="/profile/:slug/:id/:slug2/:id2" component={Profile} />
```

**NOTE**: These routes are determined by the CMS to be profiles by their matching on the the `:slug/:id` pattern. If you set up any other routes with these query arguments, the CMS will use them as profile-y links. In general you should try to avoid using this pattern, but if disambiguation is required you may add `isProfile={true}` to a route to tell the link builder what is a true profile.

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

- **Variant**: A given Dimension (above) may also have several **Variants**. If you have a dimension that is linked to a cube, e.g. a Subnational Dimension from a Japan Cube, you may add a variant of this `geo`-type dimension: e.g. a Subnational Dimension from a China cube. This allows you to have a single top-level profile (like "Subnational") that has multiple expressions/variants from different cubes, allowing you to share logic and layout between the different data feeds.

---

## Environment Variables

|variable|description|default|
|---|---|---|
|`CANON_CMS_CUBES`|Path to the mondrian or tesseract|`undefined (required)`|
|`CANON_CMS_ENABLE`|Setting this env var to `true` allows access to the cms in production builds.|`false`|
|`CANON_CMS_MINIMUM_ROLE`|The minimum integer value for a Canon user `role` to access the CMS|`1`|
|`CANON_CMS_LOGGING`|Enable verbose logging in console.|`false`|
|`CANON_CMS_REQUESTS_PER_SECOND`|Sets the `requestsPerSecond` value in the [promise-throttle](https://www.npmjs.com/package/promise-throttle) library, used for rate-limiting Generator requests|20|
|`CANON_CMS_GENERATOR_TIMEOUT`|The number of ms after which a generator request times out, defaults to 5s. Increase this if you are making heavy requests that exceed 5s|5000|
|`CANON_CMS_DEEPSEARCH_API`|Server location of Deepsearch API|`undefined`|
|`FLICKR_API_KEY`|Used to configure Flickr Authentication|`undefined`|
|`GOOGLE_APPLICATION_CREDENTIALS`|Path to JSON token file for Cloud Storage|`undefined`|
|`CANON_CONST_STORAGE_BUCKET`|Name of Google Cloud Storage Bucket|`undefined`|
|`CANON_CONST_IMAGE_SPLASH_SIZE`|Splash width to resize flickr images|1400|
|`CANON_CONST_IMAGE_THUMB_SIZE`|Thumb width to resize flickr images|200|
|`CANON_CONST_IMAGE_THUMB_SIZE`|Thumb width to resize flickr images|200|
|`OLAP_PROXY_SECRET`|For olap services that require a "x-tesseract-jwt-token" header to set in order to gain access, this variable can be used to set a private key for server-side processes.|`undefined`|

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

##### Table
Renders data in a [react-table](https://github.com/tannerlinsley/react-table/tree/v6) table. All react-table props are available.

🔥**Pro tip**: we've combined react-table's infinite nesting capability with more accessible table header markup and consistent styles. The config syntax looks like: `columns: ["col1", "col2"]` for a flat array of columns, or `columns: [["header grouping label", ["col1", "col2"]]]` from an array of grouped/named columns. If an item in the array is a *string*, it will simply be converted to a column via that string. If an item in the array is an *array*, we're assuming the first item in the nested array is a string (the name of the column group), followed by an array — which can in turn be an array which contains strings, or an array with a string and an array, and so on.

🔥**Pro tip**: You can also pass `headerFormat(key)` and `columnFormat(key, val)` to the config.

##### Graphic
Renders an image, optionally on top of a [stat](#stats). The config looks like:
```js
config: {
  imageURL: "link/to.image",
  label: "stat label", // optional
  value: "stat value", // optional
  subtitle: "stat subtitle" // optional
}
```

🔥**Pro tip**: Multiple graphic visualizations will be automatically grouped together into a grid — but only in the [default](default-layout) and [grouping](grouping-layout) section layouts.

---

## Custom Sections

#### Setup

To extend the layout and functionality of sections, custom JSX sections can be created which will be added to the list of available section types. To add a custom section:

- Create a directory in your canon app named `app/cms/sections`
- Add your custom jsx component to this directory. Observe the [default Section layout](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Default.jsx) for a starting point. Take note of the [Section wrapper](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Section.jsx) that it inherits from to see more information on the `props` that get passed down.
- In your custom jsx component, be sure to change the viz import at the top of the file from the relative path `import Viz from "../Viz/Viz";` to a module import: `import {Viz} from "@datawheel/canon-cms";`
- Create an `index.js` file in this directory that exports ALL of your custom components:

```js
export {default as CustomSection} from "./CustomSection.jsx";
export {default as CustomSection2} from "./CustomSection2.jsx";
```
- Rebuild the server
- Set your section to the new section type in Section Editor of the CMS.

#### Implementation

The [Section wrapper](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Section.jsx) handles most of the context callbacks, click interaction, anchor links, etc. required by all Sections. As such, the underlying section layouts are fairly sparse; many of them just pass the props through one by one (`Default.jsx` is a good example of this - observe the series of stats/paragraphs/sources variables).

If you need more control over how these sections are laid out, or even want to manipulate the text provided by the API, the *entire* section object is passed down via the `contents` key. In your custom component, you may emulate any `Section.jsx` variable preparation using these contents to maximize customization.

---

## Custom Visualizations

#### Setup

To extend the layout and functionality of visualizations, custom JSX visualizations can be created which will be added to the list of available visualization types. To add a custom visualization:

- Create a directory in your canon app named `app/cms/vizzes`
- Add your custom jsx component to this directory.
- Create an `index.js` file in this directory that exports ALL of your custom components:

```js
export {default as CustomViz} from "./CustomViz.jsx";
export {default as CustomViz2} from "./CustomViz2.jsx";
```
- Rebuild the server
- Set your visualization type to the new visualization type in Visualization Editor of the CMS.

---

## Search

#### Legacy Search API (Dimensions only)

The CMS is used to create Profiles based on Dimensions, such as "Geography" or "Industry". The individual entities that make up these dimensions (such as *Massachusetts* or *Metalworkers*) are referred to as Members. These members are what make up the slugs/ids in URLS; when visiting `/geo/massachusetts`, `geo` is the profile/dimension slug and `massachusetts` is the member.

These members can be viewed and edited in the in the MetaData section of the CMS. However, they can also be searched via an API endpoint, which can be useful for setting up a search feature on your site. The API endpoint is:

```
/api/search
```

Arguments are provided by url paramaters:

|parameter|description|
|---|---|
|`q`|A string query which uses the SQL `ILIKE` operator to search the `name` and `keywords` of the member. (For better results install `unaccent` package in your Postgres server running: `CREATE EXTENSION IF NOT EXISTS unaccent;`. [More info.](https://www.postgresql.org/docs/9.1/unaccent.html) )|
|`dimension`|An exact-match string to filter results to members in the provided dimension|
|`levels`|A comma-separated list of levels to filter results to members by the provided levels|
|`cubeName`|An exact-match string to filter results to members from the provided cube|
|`pslug`|If the cubeName is not known, you may provide the unique slug of the desired dimension to limit results to that profile|
|`limit`|A number, passed through to SQL `LIMIT` to limit results|
|`id`|Exact match `id` lookup. Keep in mind that a member `id` is not necessarily unique and may require a `dimension` specification|

Example query:

```
/api/search?q=mass&dimension=Geography
```

#### Profile Search API

The legacy search above is only used for searching singular dimensions, not for returning actual profiles in your CMS installation. The Profile Search still returns matching members, but more importantly, returns a list of Profiles that contain those members.

It is recommended that this search be performed using DeepSearch, running on a separate server. You can configure the CMS to point to an installation of DeepSearch using the following environment variable:

```sh
export CANON_CMS_DEEPSEARCH_API=some-api.com:88/deepsearch
```

However, if you choose not to run a DeepSearch server, the ProfileSearch API and component will fall back on a simple `%LIKE%` query on the members in the search table.

You may then import the ProfileSearch component, shown here with the default props:

```jsx
import {ProfileSearch} from "@datawheel/canon-cms";

...

<ProfileSearch
  activateKey={false} // a keyboard character that will enable the search from anywhere on the page (ie . "s")
  availableProfiles={[]} // limit the type of profile results to show (ie. ["hs92", "country"])
  columnOrder={[]} // the order of the "columns" display (ie. ["hs92", "country"])
  columnTitles={{}} // overrides for the default column titles (ie. {hs92: "Products"})
  display={"list"} // available options are "list" or "columns"
  inputFontSize={"xxl"} // the CSS size for the input box ("sm", "md", "lg", "xl", "xxl")
  joiner={"&"} // the character used when joining titles in multi-dimensional profiles
  limit={10} // how many results to show
  minQueryLength={1} // when the search query is below this number, no API requests will be made
  placeholder={"Search..."} // the placeholder text in the input element
  position={"static"} // either "static" or "absolute" (for a pop-up result window)
  subtitleFormat={result => result.memberHierarchy} // overrides for the default result subtitles
  showExamples={false} // setting this to `true` will display results when no query has been entered
/>
```

If you would prefer to build your own search component, the DeepSearch API is available at `/api/profilesearch`. Arguments are as follows:

|parameter|description|
|---|---|
|`query`|Query to search for|
|`locale`|Language for results|
|`limit`|Maximum number of results to return|
|`min_confidence`|Confidence threshold (Deepsearch Only)|

Results will be returned in a response object that includes metadata on the results. Matching members separated by profile can be found in the `profiles` key of the response object. A single grouped list of all matching profiles can be found in the `grouped` key of the response object.

---

## Advanced Generator Techniques

For complex generator calls, crafting an API URL using dynamic properties of the current member can be difficult.

### Using Member Attributes in API Calls

The most basic example of this feature is including the `id` of the current member in the API call. Say, for example, you want to retrieve the population for the current state ID. For a given state ID of `25`, your API call may look something like this:

```
/api?measures=Population&drilldowns=State&State%20ID=25
```

However, the very point of the CMS is to swap out the `25` with whatever `id` you are previewing. This is the purpose of the fixed "Attributes" Generator at the top of the Generators panel. Any of the variables in this Attributes Generator can be swapped into a Generator API URL by using the `<variable>` syntax. So, the API call above would become:

```
/api?measures=Population&drilldowns=State&State%20ID=<id>
```

And the CMS will swap `25` in for `<id>`. This allows you to make complex API calls based on the `hierarchy`, `dimension`, etc. of the current member.

### Object / Array Access

Certain elements of the Attributes Generator, such as `parents` or `user`, are objects or arrays. You may access these using dot notation and array accessors:

```
/api?hierarchy=<parents[0].value>
```

However, be warned that this is not "true" javascript, merely string manipulation, so operations like `<parents[parents.length - 1].value>` are not supported. To access the ends of lists, use a python-esque negative index accessor like so:

```
/api?hierarchy=<parents[-1].value>
```

### Accessing Member Slugs

Member slugs only exist at the CMS level for vanity-plate URL routing (e.g., /profile/country/fra, where `fra` is the member slug). The underyling cube has no knowledge of these slugs, which can make creating links to these vanity URLs in the CMS difficult.

If you want access to these slugs in your results set, you may add the `slugs` query parameter to your generator API. The CMS will intercept the payload and inject the slugs into the response.

The slugs parameter requires two elements for a successful lookup:

1) The CMS-level dimension on which the ID is considered unique (`Exporter`, `HS Product`, etc)
2) An accessor for the key in the response payload to be used for lookup (`Country`, `HS4`, etc). Note: The CMS will automatically append the ` ID` to your accessor, changing `HS4` to `HS4 ID` for example.

These parameters should be added to the generator API, using colons to separate the two required pieces:

`&slugs=Exporter:Country,HS Product:HS4`

If the pieces are the same, one parameter may be used:

`&slugs=Product`

### Custom Attributes

The fixed "Attributes" includes basic information about the currently selected member, like dimension, id, and hierarchy. This is useful because it is run *before* other generators, and can therefore be used both in subsequent `variables` object and also in API calls, using the `<bracket>` syntax.

If you would like to inject your own custom variables into the Attributes generator, create an endpoint in your canon API folder:

```js
app.post("/api/cms/customAttributes/:pid", (req, res) => {

  const pid = parseInt(req.params.pid, 10);
  const {variables, locale} = req.body;
  const {id1, dimension1, hierarchy1, slug1, name1, cubeName1, user} = variables;

  /**
   * Make axios calls, run JS, and return your compiled data as a single JS Object. Use the pid
   * given in params to return different attributes for different profiles.
   */

  if (pid === 49) {
    return res.json({
      capitalName: name1.toUpperCase()
    });
  }
  else return res.json({});

});
```

You can determine the profile pid of a given profile by checking the URL in the CMS (e.g. `http://localhost:3300/?tab=profiles&profile=49`). The POST endpoint will receive the contents of the Attributes generator in the POST body as `variables`, as well as the current `locale`.

Keep in mind that this will need to run every time a front-end profile loads, and also every time a generator or materializer is saved on the backend CMS (as it would need the variables from this endpoint to run). As a rule, try not to put any majorly heavy requests in here as it necessarily "blocks" the rest of the generator/materalizer execution.

---

## Advanced Visualization Techniques

For complex pages, you may need to communicate between visualizations, or customize other behaviors. There are a few potential use cases here:

### Interacting between visualizations

You may want an event in one visualization to have an effect on another visualization. For example, if you have a Treemap of industries, perhaps you want to be able to click "Cars" in one viz, and have a secondary viz respond to focus in on cars.

For this reason, the `setVariables` function has been added to Visualizations. This function allows you access to the `variables` object that the CMS uses to swap variables on the page. In order to achieve the example above, you could set your secondary viz to make use of a variable called `variables.secondaryId`. Then, in the primary viz, you could set the following code in your viz configuration:

```js
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

```js
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

```js
 "on":
    {
      "click": d => {
        openModal("myModalSlug");
      }
    }
```

Keep in mind that you may combine the two advanced functions! If your planned modal relies on a secondary ID, you could set something like:

```js
 "on":
    {
      "click": d => {
        setVariables({idForMyModal: d.id});
        openModal("myModalSlug");
      }
    }
```

You are then welcome, in the `myModalSlug` section, to make use of `idForMyModal` and trust that it will be set when the modal opens.

### HTML Visualizations

If you need to further customize a visualization beyond d3plus, or simply want to inject custom HTML in place a visualization at all, you may use the HTML viz type.

Create a generator variable that contains your custom HTML, and when you create a visualization, set the `html` field of your `HTML` visualization to that variable.

In advanced mode, an HTML visualization has the following format:

```js
return {
  type: "HTML",
  html: "<div>Hello World</div>"
}
```

This visualization type can even be used to embed entire iframes:

```js
return {
  type: "HTML",
  html: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>'
}
```

### Additional File Attachments

Should you need to include additional files alongside the downloadable CSV data table, you can supply the optional `dataAttachments` field with the path(s) to those files in your visualization configuration:

```js
return {
  ...
  dataAttachments: "/path/to/file.ext"
}
```
The `dataAttachments` property will also accept a list of files:

```js
  dataAttachments: ["/path/to/file1.ext", "/path/to/file2.ext"]
```
Once the list of attachments has been downloaded, it will be included with the CSV file in a ZIP archive file.

---

## Advanced Selector Techniques

Traditional selectors (dropdowns) are static. Options are added, one by one, from the list of premade variables. However, if selector lists are very long (such as a list of states) or need to automatically change (such as years when new data are added), you may need to configure dynamic selectors.

The `name` of the Selector itself, as well as defining which option(s) are the default, are configured the same way as static selectors. The main difference is that Dynamic Selectors allow you to use a variable to define the members of the dropdown, as opposed to adding pre-existing variable options one at a time.

### Dynamic Selector Formatting

Dynamic selectors are array variables. The members of that array may be objects or strings.

If the members are **objects**, you must provide the required key `option`, and the optional keys `label` and `allowed`.

|key|required|details
|---|---|---|
|`option`|required|Serves as the `value` of the `<Select/>` in the dropdown.
|`label`|optional|Value shown as label of dropdown. If not provided, defaults to the value of `option`.
|`allowed`|optional|String reference to variable to use for `allowed`. Defaults to `always`.

```js
[
  {option: "year2016", label: "2016", allowed: "profileHas2016Data"},
  {option: "year2017", label: "2017", allowed: "profileHas2017Data"},
  {option: "year2018", label: "2018", allowed: "always"},
  {option: "year2019", label: "2019"}   // allowed=always is implicit, if desired.
]
```

Remember - in static selectors, the "label" was implicitly value of the variable. However, in dynamic selectors, **the options you create will not exist in the variables object**. The exist only within this dynamic selector. In the above example, attempting to access `variables.year2018` will not return anything, as no generator ever exported `year2018` as a proper variable in and of itself.

A string configuration is also supported:

```js
["option1", "option2", "option3"]
```

In this case, `label` will default to `option` and `allowed` will default to `always`. You may also mix and match formats.

### Technical Details

Advanced users may have used the following syntax to achieve "labels" on the front end:

```js
{{[[selector1]]}}
```

On a first pass, a selector swap will change `selector1` to its selected value (say `year2018`), which leaves `{{year2018}}` behind. A second variable swap pass would then change it to `2018`, for use in a human-readable paragraph.

In dynamic selectors, as mentioned above, `year2018` will not exist as such. Therefore, a step has been added BETWEEN the selector swap and the variable swap, which will use user-defined `labels` as a temporary variable lookup. This behavior allows users to continue to use the `{{[[selector1]]}}` format they are used to, and can trust that it will turn `year2018` into `2018`, even though `year2018` is not in the variables object.

---

## Authentication

Canon CMS makes use of the [User Management](https://github.com/Datawheel/canon#user-management) from Canon Core. If `CANON_LOGINS` is set to true, the CMS will require a user of `role` of `1` or higher to access the CMS.

To configure the minimum role for CMS access, use the `CANON_CMS_MINIMUM_ROLE` environment variable.

The CMS also exports the `user` object and a `userRole` boolean for the currently logged in user in the Locked Attributes Generator for every profile. You can make use of these variables to hide, show, or limit information based on the role of the currently logged in user.

**Note:** If you create new variables from the user data (e.g., `const isPro = role >= 1`), these operations **must** be performed in materializers to have any effect.

---

## Profile Caching

Before releasing a production server, it is a good practice to enable some sort of caching (like NGINX) on the server so that subsequent visits to specific profile pages don't need to run all of their generators again. The CMS contains a `canon-cms-warmup` script that will ping every possible profile page, in order of their zvalue.

```sh
Usage: npx canon-cms-warmup <command> [args]

Commands:
    help    Shows this information.
    run     Inits a scan of all available routes in the installed CMS.
            - Required: base, db[-props]
            - Optional: output, password, profile, threads, username
    retry   Reads an outputted file from a previous scan and retries to load
            the failed endpoints.
            - Required: input
            - Optional: threads, output

If command is not set, "run" will be executed.

Arguments:
    -b, --base      The root url to use as template in the generation.
                    Use ":profile" for the profile name, and ":page" for the page slug.
    -h, --help      Shows this information.
    -H, --header    Set a header for all requests.
                    This parameter must be used once for each "key: value" combo.
    -i, --input     The path to the file that contains the errored endpoints.
    -o, --output    The path to the file where to log the errored endpoints.
    -p, --password  The password in case of needing basic authentication.
        --profile   A comma separated string of the profiles that should be loaded.
                    If omitted or empty, all available profiles will be used.
    -t, --threads   The number of concurrent connections to work with. Default: 2.
    -u, --username  The username in case of needing basic authentication.
        --db-host   The host and port where to connect to the database.
                    Defaults to "localhost:5432".
        --db-name   The name of the database where the info is stored.
        --db-user   The username to connect to the database.
        --db-pass   The password to connect to the database, if needed.
        --db        The full connection URI string to connect to the database.
                    Format is "engine://dbUser:dbPswd@dbHost/dbName".
                    If this variable is set, the previous ones are ignored.
```

---

## Frequently Asked Questions

### What is the structure of the JavaScipt _Object_ that a visualization returns?

The visualizations are powered by [D3plus](http://d3plus.org/), a JavaScript library also made by Datawheel that simplifies drawing visualizations using D3 by providing many helpful defaults. To get started, you always need to define at least the following 3 things:

1. **data** - without data, no visualization can be drawn! To provide data, set the `data` key inside of the returned _Object_ to either a _String_ URL or an _Array_ of data objects. You can also provide an optional callback function for URLs as the `dataFormat` key, which will allow you to transform the loaded data in any way necessary for the visualization (like calculating a "share" percentage based on the total data returned).

2. **type** - you also need to defined what type of visualization to draw, such as a BarChart or a LinePlot. You can provide any D3plus visualziation class name as a _String_ to the `type` key of the return Object, as well as a few custom HTML based visualizations that come packages with the CMS (like `"Table"` and `"Graphic"`). Check out [the code](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/Viz/Viz.jsx#L14) to see the most current list of exports, as well as reference the [d3plus docs](http://d3plus.org/docs/).

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
- [canon-cms@0.12.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.12.0)
- [canon-cms@0.13.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.13.0)

___

## Migration

For upgrading to new versions, there are currently several migration scripts:

1) `npx canon-cms-migrate-legacy` (for DataUSA)
2) `npx canon-cms-migrate-0.1` (for CDC or other 0.1 CMS users)
3) `npx canon-cms-migrate-0.6` (for 0.6 CMS users)
4) `npx canon-cms-migrate-0.7` (for 0.7 CMS users)
5) `npx canon-cms-migrate-0.8` (for 0.8 CMS users)
6) `npx canon-cms-migrate-0.9` (for 0.9 CMS users, for upgrade to 0.11 ONLY)
7) `npx canon-cms-migrate-0.11` (for 0.10 or 0.11 CMS users, for upgrade to 0.12 ONLY)
8) `npx canon-cms-migrate-0.12` (for 0.12 CMS users)

**Note:** Canon CMS Version 0.10.0 did **NOT** require a database migration, so the `0.9` script will output a `0.11` database.

**Note:** Unlike all other migrations, the `0.11` -> `0.12` migration script performs a total search re-ingest from the source cubes. This means that the following env vars MUST be set in the environment where are you running the migration, AND they must match your production credentials to ensure a proper ingest.

- `CANON_CMS_CUBES` - Required for connecting to the Cube
- `CANON_LANGUAGES` - Required for cube ingest so language data can be populated. Make sure this matches your prod setup!
- `CANON_LANGUAGE_DEFAULT` - Required for slug generation - slugs for search members are generated based on the default language.
- `CANON_CMS_LOGGING` - Not required, but recommended to turn on to observe the migration for any errors.


### Instructions

The name of the script represents the version you wish to migrate **FROM**.  So, to upgrade a DB from 0.6 to 0.7, one would use `npx canon-cms-migrate-0.6`.  Currently both `legacy` and `0.1` upgrade directly to `0.6`.  From here on out, versions will upgrade **one dot version at a time** (exception: 0.9 to 0.11).

It is necessary that users spin up an entire new database for any CMS migration.

The user need configure two sets of environment variables, `OLD` and `NEW`.

```
CANON_CMS_MIGRATION_OLD_DB_NAME
CANON_CMS_MIGRATION_OLD_DB_USER
CANON_CMS_MIGRATION_OLD_DB_PW
CANON_CMS_MIGRATION_OLD_DB_HOST

CANON_CMS_MIGRATION_NEW_DB_NAME
CANON_CMS_MIGRATION_NEW_DB_USER
CANON_CMS_MIGRATION_NEW_DB_PW
CANON_CMS_MIGRATION_NEW_DB_HOST
```

These variables represent the old db you are migration **from** and the new db you are migrating **to**.  The new db will be **wiped every time** you run the script - the idea here is that you are building a new db from scratch.

🔥 WHATEVER DB YOU CONFIGURE AS **NEW** WILL BE COMPLETELY DESTROYED AND BUILT FROM SCRATCH 🔥
🔥 DO NOT SET `CANON_CMS_MIGRATION_NEW_DB_*` TO A CURRENTLY IMPORTANT DB🔥

After the migration is done, you can switch your dev environment to the new DB for testing, and eventually switch it to prod.
