# Canon CMS

Content Management System for Canon sites.

## Table of Contents

- [Why?](#why)
- [Setup and Installation](#setup-and-installation)
- [Enabling Image Support](#enabling-image-support)
- [Rendering a Profile](#rendering-a-profile)
- [Overview and Terminology](#overview-and-terminology)
- [Environment Variables](#environment-variables)
- [Sections](#sections)
- [Custom Sections](#custom-sections)
- [Custom Visualizations](#custom-visualizations)
- [Hidden Profiles](#hidden-profiles)
- [Search](#search)
- [PDF Printing](#pdf-printing)
- [Profile Comparisons](#profile-comparisons)
- [Advanced Generator Techniques](#advanced-generator-techniques)
- [Advanced Visualization Techniques](#advanced-visualization-techniques)
- [Advanced Selector Techniques](#advanced-selector-techniques)
- [Automatic Translations](#automatic-translations)
- [Command Line Reingest](#command-line-reingest)
- [Authentication](#authentication)
- [Profile Caching](#profile-caching)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Release Notes](#release-notes)
- [Migration](#migration)
- [Sitemaps](#sitemaps)

---

## Why?

Building websites can be hard, especially when they need to display _tons_ of information. For a company like Datawheel, an organization that needs to build maintainable sites that can showcase data from thousands of data "members," the creation of _data-agnostic, dynamic templates_ that can render beautiful web pages (or "profiles") is crucial. The Canon CMS fulfills this need by giving content creators and translators the tools they need to be able to author and update page templates easily.

Canon CMS allows users to:

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

Canon CMS uses the `canon`-level user model to handle authentication and edit permissions, in addition to some other models to store the content of the CMS templates. You must configure these modules manually on the application's `canon.js` file:

```js
module.exports = {
  ...,
  db: [{
    host: process.env.CANON_DB_HOST,
    name: process.env.CANON_DB_NAME,
    user: process.env.CANON_DB_USER,
    pass: process.env.CANON_DB_PW,
    tables: [
      require("@datawheel/canon-core/models"),
      require("@datawheel/canon-cms/models"),
    ]
  }]
  ...,
};
```

This tells the app what database schema/tables are needed for your application and where to find the database that will hold them. If you have not already, you will need to create a database (and ideally a new role to manage it) using postgresql. Once you have configured this, you can then define the connection parameters in the environment variables, using the keys you set in the code (e.g. `CANON_DB_XXXX`). Check the documentation for canon-core's DB configuration for more info on how the setup works.

Please note Canon CMS currently only supports Postgres databases.

#### 3) Configure `canon` vars

There are a number of [canon-core environment variables](https://github.com/Datawheel/canon#additional-environment-variables) that `canon-cms` relies on. Ensure that the the following env vars are set.

Canon CMS relies on `canon` needs, so be sure your `CANON_API` is set:

```sh
export CANON_API=http://localhost:3300
```

CMS content that you author can be translated into other languages. Set `CANON_LANGUAGE_DEFAULT` to your locale. If you plan to translate your content, set `CANON_LANGUAGES` to a comma separated list of languages you wish to use. Note that while `CANON_LANGUAGES` can be changed later, `CANON_LANGUAGE_DEFAULT` cannot, so remember to set it before starting!

```sh
export CANON_LANGUAGE_DEFAULT=en
export CANON_LANGUAGES=en,es
```

#### 4) Configure `canon-cms` vars

Canon CMS requires a `canon-cms` specific env var for the current location of your mondrian or tesseract installation.

```sh
export CANON_CMS_CUBES=https://tesseract-url.com/tesseract
```

In summary, your env vars should now look like this:

```sh
export CANON_API=http://localhost:3300
export CANON_LANGUAGE_DEFAULT=en
export CANON_LANGUAGES=en,es
export CANON_CMS_CUBES=https://tesseract-url.com/tesseract
export CANON_DB_USER=db_user_name
export CANON_DB_PW=db_user_password
export CANON_DB_NAME=db_name
export CANON_DB_HOST=db_host
```

Remember the actual value of all of the `CANON_DB_XXXX` variables (or single `CANON_DB_CONNECTION_STRING` variable if you want to combine them) is up to you as it depends on how you configured your Postgres database.

By default, the CMS will only be enabled on development environments. If you wish to enable the CMS on production, see the `CANON_CMS_ENABLE` in [Environment Variables](#environment-variables) below.

#### 5) (Optional) Add Proxy for Local Tesseract Instance

Your `CANON_CMS_CUBES` variable will (obviously) differ based on your project. If you are developing against a _local instance of tesseract_, you will likely need to add a simple proxy to bypass CORS errors from requesting data between different ports. To do this, you will need to add a file called `local-proxy.js` in the `/api/` directory in the root level of your project (create one if you don't have one). The file should then look like [this](https://gist.github.com/greenrhyno/018042999a0deab501529224764c0fa4).

#### 4) Add the Builder Component to a route

In `app/routes.jsx`, make the following additions to add a route to the CMS builder:

```jsx
import {Builder} from "@datawheel/canon-cms";

...

<Route path="/cms" component={Builder} />
```

#### 5) Configure Redux

The CMS state state is managed from the site-wide redux state. In `app/store/index.js`, import the reducer function and assign it to the `cms` key:

```js
import {cmsReducer} from "@datawheel/canon-cms";

(...)

export const reducers = {
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

Canon CMS includes the ability to assign each member of a cube (Such as _Massachusetts_, or _Metalworkers_) an acceptably licensed photo from flickr or a custom upload.

### Custom Uploads (no Flickr Source)

Upload custom images using the Metadata tab of the CMS. This requires no `FLICKR_API_KEY`, nor any cloud configuration. The images will be stored in PSQL as blobs, or in S3 if configured (see options below)

### Local Hosting with Flickr Source

The CMS now supports images stored inside the psql database by default. If your installation is on the smaller side or is not using Google Cloud, no cloud configuration is required here. Image uploads will automatically be stored in the new "splash" and "thumb" columns of the database, and served up at the identical path to the cloud-hosted ones. This does make the .sql backups slightly larger, but avoids the need to manage a cloud hosting solution.

Local hosting still requires a flickr key, so be sure to configure that:

```sh
export FLICKR_API_KEY=your_api_key
```

If you would prefer to use cloud hosting for its regional availability and scalability, or to keep your psql size small, or if you are already using Google Cloud, it is generally better to use S3 hosting, and you can use the following steps for that.

Note: If you decide to change from local to remote at a later time, this is possible, and new images will be hosted remotely (the image endpoint tries both locations). If an image is hosted locally but cloud is enabled, a button will appear in the Metadata browser of the CMS which allows you to fix this (local to remote) with a single click.

### Remote (S3 Storage) hosting in Google Cloud

If you choose to host images remotely as opposed to locally, a series of steps must be taken to configure both the flickr authentication and the Google Cloud Storage for image hosting. Contact the Admin who is in charge of this project's Google Cloud Project, or get permissions to do the following:

#### 1) Create a bucket

In the Storage section of Google Cloud Projects, create a bucket and give it a name. Set the var `CANON_CONST_STORAGE_BUCKET` to the name you provided.

```sh
export CANON_CONST_STORAGE_BUCKET=your_bucketname
```

#### 2) Create and Download a JSON Token

Follow the instructions [here](https://cloud.google.com/docs/authentication/getting-started) to create a JSON token with "Cloud Storage -> Storage Admin" permissions.

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

Or, in rare cases where `id` is not unique enough, you may use the guaranteed-unique member slug:

```
/api/image?slug=<slug>&memberSlug=<memberSlug>
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

- **Materializer**: Similar to a Generator, but with no API call. Materializers are guaranteed to be run _after_ Generators, and in a strict order. Any materializer can make use of variables generated before it. Useful for datacalls that need to be combined, or for arbitrary variables (like CMS rules or about text)

- **Formatter**: A formatter is a javascript function that will be applied to a variable. It receives one input, **n**, and returns a String. For example, take a javascript integer and add commas to make it a human-readable number.

### Cube / Data Elements

- **Cube**: A queryable data store. For the purposes of this README, think of it as a database you can make API requests to.

- **Dimension**: Any given Profile in the CMS must be linked to one or more dimensions. Examples include "Geography," "University," or "CIP" (Industry). You could have a `geo` profile, which is linked to the "Geography" dimension, whose members are things like Massachusetts or New York.

- **Variant**: A given Dimension (above) may also have several **Variants**. If you have a dimension that is linked to a cube, e.g. a Subnational Dimension from a Japan Cube, you may add a variant of this `geo`-type dimension: e.g. a Subnational Dimension from a China cube. This allows you to have a single top-level profile (like "Subnational") that has multiple expressions/variants from different cubes, allowing you to share logic and layout between the different data feeds.

---

## Environment Variables

| variable                         | description                                                                                                                                                               | default                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `CANON_CMS_CUBES`                | Path to the mondrian or tesseract                                                                                                                                         | `undefined (required)` |
| `CANON_CMS_ENABLE`               | Setting this env var to `true` allows access to the cms in production builds.                                                                                             | `false`                |
| `CANON_CMS_MINIMUM_ROLE`         | The minimum integer value for a Canon user `role` to access the CMS                                                                                                       | `1`                    |
| `CANON_CMS_LOGGING`              | Enable verbose logging in console.                                                                                                                                        | `false`                |
| `CANON_CMS_REQUESTS_PER_SECOND`  | Sets the `requestsPerSecond` value in the [promise-throttle](https://www.npmjs.com/package/promise-throttle) library, used for rate-limiting Generator requests           | 20                     |
| `CANON_CMS_GENERATOR_TIMEOUT`    | The number of ms after which a generator request times out, defaults to 5s. Increase this if you are making heavy requests that exceed 5s                                 | 5000                   |
| `CANON_CMS_DEEPSEARCH_API`       | Server location of Deepsearch API                                                                                                                                         | `undefined`            |
| `CANON_CMS_LUNR`                 | Enable Basic LUNR search                                                                                                                                                  | `undefined`            |
| `CANON_CMS_FORCE_HTTPS`          | Force use of HTTPS for customAttributes                                                                                                                                   | `undefined`            |
| `CANON_CMS_HTACCESS_USER`        | Authentication user for PDF generation on .htaccess protected pages                                                                                                       | `undefined`            |
| `CANON_CMS_HTACCESS_PW`          | Authentication password for PDF generation on .htaccess protected pages                                                                                                   | `undefined`            |
| `CANON_CMS_PDF_DISABLE`          | Disable the PDF generation endpoint                                                                                                                                       | `undefined`            |
| `FLICKR_API_KEY`                 | Used to configure Flickr Authentication                                                                                                                                   | `undefined`            |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to JSON token file for Cloud Storage                                                                                                                                 | `undefined`            |
| `CANON_CONST_STORAGE_BUCKET`     | Name of Google Cloud Storage Bucket                                                                                                                                       | `undefined`            |
| `CANON_CONST_IMAGE_SPLASH_SIZE`  | Splash width to resize flickr images                                                                                                                                      | 1400                   |
| `CANON_CONST_IMAGE_THUMB_SIZE`   | Thumb width to resize flickr images                                                                                                                                       | 200                    |
| `CANON_CONST_IMAGE_THUMB_SIZE`   | Thumb width to resize flickr images                                                                                                                                       | 200                    |
| `OLAP_PROXY_SECRET`              | For olap services that require a "x-tesseract-jwt-token" header to set in order to gain access, this variable can be used to set a private key for server-side processes. | `undefined`            |

---

## Sections

Sections are the chunks of content you will use to build a page. Each section contains [metadata](#section-metadata) fields, and various [content entities](#content-entities).

### Section metadata

Used to customize the way the section behaves. Metadata fields include:

#### Title

The name of the section. This will be used by the heading tag on the profile, and in the admin panel navigation.

#### Slug

An ID for referencing the section. This is used to link directly to a section via scrolling anchor links, and is used in the construction of share links. Each section on a page _must_ have a unique ID.

#### Visibility

The truthiness of this value will be used to determine whether or not the section appears on a given profile.

---

#### Layouts

Change the way the section looks and behaves. Out of the box, the following section layouts are included:

##### Hero layout

The hero section is typically the first thing a user sees upon visiting a profile. It fills up most of the screen, displays the title in large type, and features an image or set of images in the background. If the section does not include a visualization, the text will be centered. If the section _does_ include a visualization, the layout will switch to two columns, with the visualization on the right.

The first section in each profile is automatically assigned this layout, and _only_ the first section in a profile can use this layout.

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

At first, this layout may appear to be similar to the [default](#default-layout) layout. However, each visual in the section will become its own _panel_, which can be accessed via the automatically generated button group in the sidebar.

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

🔥**Pro tip**: we've combined react-table's infinite nesting capability with more accessible table header markup and consistent styles. The config syntax looks like: `columns: ["col1", "col2"]` for a flat array of columns, or `columns: [["header grouping label", ["col1", "col2"]]]` from an array of grouped/named columns. If an item in the array is a _string_, it will simply be converted to a column via that string. If an item in the array is an _array_, we're assuming the first item in the nested array is a string (the name of the column group), followed by an array — which can in turn be an array which contains strings, or an array with a string and an array, and so on.

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

#### Using `allowed`

Nearly every entity in the CMS, sections, paragraphs, selectors, vizes, even generators, has access to a concept known as `allowed` (sometimes labeled `Visibility`).

This value is a variable from your list of variables whose truthiness determines whether to show (in the case of text) or execute (in the case of a generator) this entity.

This can be used to hide sections dynamically, list only certain select options for given members, or only run generators for certain members.

#### Applying Styles

React-table provides access to a `Cell` method, referenced [here](https://github.com/tannerlinsley/react-table/tree/v6#example), which allows the return of a JSX element for formatting purposes. However, CMS visualization definitions are written in ES6 and run client-side, and therefore cannot be transpiled into JSX. This architectural mismatch is a side effect of combining the d3plus style "plain old javascript" configuration with a JSX component, namely React-Table. The JSX parameters that React-Table wants can't always be provided by vanilla, untranspiled front-end js.

However, if you need access to the `cell` object (to format its styles or value), a `cellStyle` method has been added to the column definition. This method is invoked inside the JSX callback, so you have may modify and return the object (ES6 only!)

```js
return {
  columns: [
    {Header: "custom", accessor: "id"},
    {Header: "headers", accessor: "x", cellStyle: row => {
      row.styles.color = "red";
      row.value = row.value + "%";
      return row;
    }},
    {Header: "testing", accessor: "y"}
  ],
  ...
};
```

This `cellStyle` method operates much like the `Cell` method of react-table, but again, _you may not return a JSX element_. Make vanilla ES6 modifications to the object and return it.

---

## Custom Sections

#### Setup

To extend the layout and functionality of sections, custom JSX sections can be created which will be added to the list of available section types. To add a custom section:

- Create a directory in your canon app named `app/cms/sections`
- Add your custom jsx component to this directory. Observe the [default Section layout](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Default.jsx) for a starting point. Take note of the [Section wrapper](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Section.jsx) that it inherits from to see more information on the `props` that get passed down.
- In your custom jsx component, be sure to change the viz import at the top of the file from the relative path `import Viz from "../Viz/Viz";` to a module import: `import {Viz} from "@datawheel/canon-cms";`
- Create an `index.js` file in this directory that exports ALL of your custom components:

```js
export { default as CustomSection } from "./CustomSection.jsx";
export { default as CustomSection2 } from "./CustomSection2.jsx";
```

- Rebuild the server
- Set your section to the new section type in Section Editor of the CMS.

#### Implementation

The [Section wrapper](https://github.com/Datawheel/canon/blob/master/packages/cms/src/components/sections/Section.jsx) handles most of the context callbacks, click interaction, anchor links, etc. required by all Sections. As such, the underlying section layouts are fairly sparse; many of them just pass the props through one by one (`Default.jsx` is a good example of this - observe the series of stats/paragraphs/sources variables).

If you need more control over how these sections are laid out, or even want to manipulate the text provided by the API, the _entire_ section object is passed down via the `contents` key. In your custom component, you may emulate any `Section.jsx` variable preparation using these contents to maximize customization.

---

## Custom Visualizations

#### Setup

To extend the layout and functionality of visualizations, custom JSX visualizations can be created which will be added to the list of available visualization types. To add a custom visualization:

- Create a directory in your canon app named `app/cms/vizzes`
- Add your custom jsx component to this directory.
- Create an `index.js` file in this directory that exports ALL of your custom components:

```js
export { default as CustomViz } from "./CustomViz.jsx";
export { default as CustomViz2 } from "./CustomViz2.jsx";
```

- Rebuild the server
- Set your visualization type to the new visualization type in Visualization Editor of the CMS.

---

## Hidden Profiles

#### Profile visibility

Profiles have a `Visibility` Dropdown in the Profile Editor panel that may be set to `Hidden` for pre-production profiles. Hiding a Profile will result in all profile paths returning a 404, as well as all legacy search endpoints excluding it from results (Note: Deepsearch is not included in this behavior, it must access the `canon-cms` db directly to mirror this behavior).

#### Variant Visibility

Individual profile variants can also be hidden, which will result in the same behavior as above. Importantly, _profile visibility always trumps variant visibility_.

#### A note on search

The `/api/search` legacy search route will respect these hidden profiles and not return results from them. However, in some cases (such as the CMS), it is desirable for the search to ignore this restriction. Adding a `?cms=true` query param to the search endpoint will bypass the hidden profiles and show all members that match the query.

---

## Search

#### Legacy Search API (Dimensions only)

The CMS is used to create Profiles based on Dimensions, such as "Geography" or "Industry". The individual entities that make up these dimensions (such as _Massachusetts_ or _Metalworkers_) are referred to as Members. These members are what make up the slugs/ids in URLS; when visiting `/geo/massachusetts`, `geo` is the profile/dimension slug and `massachusetts` is the member.

These members can be viewed and edited in the in the MetaData section of the CMS. However, they can also be searched via an API endpoint, which can be useful for setting up a search feature on your site. The API endpoint is:

```
/api/search
```

Arguments are provided by url paramaters:

| parameter   | description                                                                                                                                                                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`         | A string query which uses the SQL `ILIKE` operator to search the `name` and `keywords` of the member. (For better results install `unaccent` package in your Postgres server running: `CREATE EXTENSION IF NOT EXISTS unaccent;`. [More info.](https://www.postgresql.org/docs/9.1/unaccent.html) ) |
| `dimension` | An exact-match string to filter results to members in the provided dimension                                                                                                                                                                                                                        |
| `levels`    | A comma-separated list of levels to filter results to members by the provided levels                                                                                                                                                                                                                |
| `cubeName`  | An exact-match string to filter results to members from the provided cube                                                                                                                                                                                                                           |
| `pslug`     | If the cubeName is not known, you may provide the unique slug of the desired dimension to limit results to that profile                                                                                                                                                                             |
| `limit`     | A number, passed through to SQL `LIMIT` to limit results                                                                                                                                                                                                                                            |
| `id`        | Exact match `id` lookup. Keep in mind that a member `id` is not necessarily unique and may require a `dimension` specification                                                                                                                                                                      |
| `cms`       | If set to true, bypasses all "Hiding" functionality (profile, variant, or member) and shows ALL matching results.                                                                                                                                                                                   |

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
  defaultCubes={false} // default cube names (comma-separate) to use when mounting the component
  defaultLevels={false} // default level names (comma-separate) to use when mounting the component
  defaultProfiles={false} // default profile IDs (comma-separate) to use when mounting the component
  defaultQuery={""} // default search query to use when mounting the component
  display={"list"} // available options are "list", "columns", and "grid"
  filters={false} // enables a set of nested profile, hierarchy, and cube filters
  filterCubeTitle={cubeName => cubeName} // cube title used for filters (allows for grouping cubes with matching labels)
  filterDimensionTitle={dimension => dimension} // dimension title used for filters (allows for grouping dimensions with matching labels)
  filterHierarchyTitle={hierarchy => hierarchy} // hierarchy title used for filters (allows for grouping hierarchies with matching labels)
  filterProfileTitle={(content, meta) => content.label} // profile title used for filters (allows for grouping profiles with matching labels)
  filterQueryArgs={false} // enables filters to update the query string
  formatResults={resp => resp} // callback function to modify the JSON response used for rendering
  ignoredTerms={[]} // array of ignored terms that will be removed before call /profilesearch endpoint. For example: ["of","the", ...]. Defaults []. You can find a list per language in here: https://countwordsfree.com/stopwords
  inputFontSize={"xxl"} // the CSS size for the input box ("sm", "md", "lg", "xl", "xxl")
  joiner={"&"} // the character used when joining titles in multi-dimensional profiles
  limit={10} // how many results to show
  minQueryLength={1} // when the search query is below this number, no API requests will be made
  placeholder={"Search..."} // the placeholder text in the input element
  position={"static"} // either "static" or "absolute" (for a pop-up result window)
  renderListItem={(result, i, link, title, subtitle) =>
    <li key={`r-${i}`} className="cms-profilesearch-list-item">
      <a href={link} className="cms-profilesearch-list-item-link">
        {title}
        <div className="cms-profilesearch-list-item-sub u-font-xs">{subtitle}</div>
      </a>
    </li>} // component that is rendered when display is "list"
  renderTile={(result, i, tileProps) => <ProfileTile key={`r-${i}`} {...tileProps} data={result} />} // component that is rendered when display is "columns" or "grid"
  subtitleFormat={result => result.memberHierarchy} // overrides the default result subtitles
  titleFormat={d => d.name} // overrides the default result title
  showExamples={false} // setting this to `true` will display results when no query has been entered
  showFilters={false} // show a faceted search underneath the input box
  showLaterals={false} // Force to return top 5 combination for bilaterals results, even with just one word in q.
/>
```

If you would prefer to build your own search component, the DeepSearch API is available at `/api/profilesearch`. Arguments are as follows:

| parameter        | description                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `query`          | Query to search for                                                                                  |
| `locale`         | Language for results                                                                                 |
| `limit`          | Maximum number of results to return                                                                  |
| `profile`        | Restrict results to a profile, must be an integer profile id or a profile slug (unary profiles only) |
| `dimension`      | Restrict results by dimension (comma separated)                                                      |
| `hierarchy`      | Restrict results by hierarchy (comma separated)                                                      |
| `cubeName`       | Restrict results by source cube name (comma separated)                                               |
| `min_confidence` | Confidence threshold (Deepsearch Only)                                                               |

Results will be returned in a response object that includes metadata on the results. Matching members separated by profile can be found in the `profiles` key of the response object. A single grouped list of all matching profiles can be found in the `grouped` key of the response object.

---

## PDF Printing

ALl CMS profiles will contain a "Download as PDF" button in their hero section, which allows users to download the entire page as 1 long PDF file.

#### Deployment

The PDF Printing in the CMS utilizes the Puppeteer library to handle the heavy lifting of generating the PDFs on the server (it is a headless browser). Most issues deploying to a production server can be solved by their [troubleshooting support doc](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix), but for most cases the following steps will have to be done on a new server:

##### Install UNIX dependencies (Debian/Ubuntu)

```sh
sudo apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

##### Install UNIX dependencies (CentOS)

```sh
sudo yum update
```

```sh
sudo yum install alsa-lib.x86_64 atk.x86_64 cups-libs.x86_64 gtk3.x86_64 ipa-gothic-fonts libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXrandr.x86_64 libXScrnSaver.x86_64 libXtst.x86_64 pango.x86_64 xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1 xorg-x11-utils
```

```sh
sudo yum update nss -y
```

##### Enable namespaces (CentOS)

Chromium requires a sandboxed namespace in which to run its headless browser. Note that the following statement may require you to be the root user, in which case you should `sudo su` before executing.

```sh
echo 10000 > /proc/sys/user/max_user_namespaces
```

#### React Component

The CMS package exports a `<PDFButton />` component that can theoretically be placed on any page. This button handles all of the round-trip logic for generating a PDF of the current page, so implementation should be drop-in. Here are the available props and their defaults:

```jsx
import {PDFButton} from "@datawheel/canon-cms";
...
<PDFButton
  className="" // a custom class attribute for the button itself
  filename="your-file-name" // the name of the resulting PDF file downloaded
  pdfOptions={{}} // additional options to pass the puppeteer.pdf function (custom headers, footers, sizing, etc). Results in a POST request - see below.
  viewportOptions={{}} // additional viewport options to pass the puppeteer.pdf function. Results in a POST request - see below.
/>
```

#### A Note on PDF GET/POST operations

If `pdfOptions` or `viewportOptions` are set in the `<PDFButton>`, the PDF generation will require a `POST` request in order to transmit the JSON configuration object. If you want PDF routes to be cached however, they need to be `GET` operations. To achieve this, remove `pdfOptions` and `viewportOptions` from the `<PDFButton>` component, and move these objects to the `canon.js` file, under a top-level key named `pdf`. The default behavior of `<PDFButton>` when not supplied with options is to perform a `GET` request using the configurations in `canon.js`.

Additionally, Puppeteer doesn't play nicely with `href` images in its headers. To `src` images in `headerTemplate`, the image must be included directly as a base64 buffer:

```js
const path = require("path");
const fs = require("fs");
const imagePath = path.resolve("static/images/pdf-header.png");
const buffer = fs.readFileSync(imagePath, {encoding: "base64"});
const pdfHeader = `data:image/png;base64,${buffer}`;

...

pdf: {
  pdfOptions: {
    headerTemplate: `<div style="width: 100%;">
      <img src="${pdfHeader}" width="100%" />
    </div>`,

...
```

#### Disabling PDF Routes

If needed for security/environment reasons, the pdf generation endpoints can be disabled by setting `CANON_CMS_PDF_DISABLE` to `true`.

---

## Profile Comparisons

To enable a button that appears in every Profile hero section, allowing users to add a side-by-side comparison profile of the same type, set the following environment variable to `true`:

```sh
export CANON_CONST_PROFILE_COMPARISON=true
```

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

1. The CMS-level dimension on which the ID is considered unique (`Exporter`, `HS Product`, etc)
2. An accessor for the key in the response payload to be used for lookup (`Country`, `HS4`, etc). Note: The CMS will automatically append the ` ID` to your accessor, changing `HS4` to `HS4 ID` for example.

These parameters should be added to the generator API, using colons to separate the two required pieces:

`&slugs=Exporter:Country,HS Product:HS4`

If the pieces are the same, one parameter may be used:

`&slugs=Product`

In some rare edge cases, a dimension and id are not enough to disambiguate a member. In these cases, a third argument can be passed, which refers to _the cube on which the given id is considered unique_:

`&slugs=HS Product:HS4:trade_i_baci_a_92`

Note that when using this cube disambiguation, you may not use the singular parameter, all three must be provided.

### Custom Attributes

The fixed "Attributes" includes basic information about the currently selected member, like dimension, id, and hierarchy. This is useful because it is run _before_ other generators, and can therefore be used both in subsequent `variables` object and also in API calls, using the `<bracket>` syntax.

If you would like to inject your own custom variables into the Attributes generator, create an endpoint in your canon API folder:

```js
app.post("/api/cms/customAttributes/:pid", (req, res) => {
  const pid = parseInt(req.params.pid, 10);
  const { variables, locale } = req.body;
  const { id1, dimension1, hierarchy1, slug1, name1, cubeName1, user } =
    variables;

  /**
   * Make axios calls, run JS, and return your compiled data as a single JS Object. Use the pid
   * given in params to return different attributes for different profiles.
   */

  if (pid === 49) {
    return res.json({
      capitalName: name1.toUpperCase()
    });
  } else return res.json({});
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
};
```

This visualization type can even be used to embed entire iframes:

```js
return {
  type: "HTML",
  html: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>'
};
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
dataAttachments: ["/path/to/file1.ext", "/path/to/file2.ext"];
```

Once the list of attachments has been downloaded, it will be included with the CSV file in a ZIP archive file.

---

## Advanced Selector Techniques

Traditional selectors (dropdowns) are static. Options are added, one by one, from the list of premade variables. However, if selector lists are very long (such as a list of states) or need to automatically change (such as years when new data are added), you may need to configure dynamic selectors.

The `name` of the Selector itself, as well as defining which option(s) are the default, are configured the same way as static selectors. The main difference is that Dynamic Selectors allow you to use a variable to define the members of the dropdown, as opposed to adding pre-existing variable options one at a time.

### Dynamic Selector Formatting

Dynamic selectors are array variables. The members of that array may be objects or strings.

If the members are **objects**, you must provide the required key `option`, and the optional keys `label` and `allowed`.

| key       | required | details                                                                               |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| `option`  | required | Serves as the `value` of the `<Select/>` in the dropdown.                             |
| `label`   | optional | Value shown as label of dropdown. If not provided, defaults to the value of `option`. |
| `allowed` | optional | String reference to variable to use for `allowed`. Defaults to `always`.              |

```js
[
  { option: "year2016", label: "2016", allowed: "profileHas2016Data" },
  { option: "year2017", label: "2017", allowed: "profileHas2017Data" },
  { option: "year2018", label: "2018", allowed: "always" },
  { option: "year2019", label: "2019" } // allowed=always is implicit, if desired.
];
```

Remember - in static selectors, the "label" was implicitly value of the variable. However, in dynamic selectors, **the options you create will not exist in the variables object**. The exist only within this dynamic selector. In the above example, attempting to access `variables.year2018` will not return anything, as no generator ever exported `year2018` as a proper variable in and of itself.

A string configuration is also supported:

```js
["option1", "option2", "option3"];
```

In this case, `label` will default to `option` and `allowed` will default to `always`. You may also mix and match formats.

### Technical Details

Advanced users may have used the following syntax to achieve "labels" on the front end:

```js
{
  {
    [[selector1]];
  }
}
```

On a first pass, a selector swap will change `selector1` to its selected value (say `year2018`), which leaves `{{year2018}}` behind. A second variable swap pass would then change it to `2018`, for use in a human-readable paragraph.

In dynamic selectors, as mentioned above, `year2018` will not exist as such. Therefore, a step has been added BETWEEN the selector swap and the variable swap, which will use user-defined `labels` as a temporary variable lookup. This behavior allows users to continue to use the `{{[[selector1]]}}` format they are used to, and can trust that it will turn `year2018` into `2018`, even though `year2018` is not in the variables object.

---

## Automatic Translations

If your CMS is configured with more than one language (using `CANON_LANGUAGES` and `CANON_LANGUAGE_DEFAULT`), you can use the Google Translate API to automatically fill in the target language. For security reasons, the CMS must make use of `CANON_LOGINS` and be accessed by a logged-in user in order for translations to be enabled.

🔥 **General Warning** 🔥 The translation script is a profile-wide, or even installation-wide, massive in-place update. It mercilessly paves almost all of the written content of the target language, so remember to be **100% sure** of your configurations and target language. And as always, **make a backup first**.

### Enabling Translation API

Enable the Translation API for your cloud project [here](https://console.cloud.google.com/apis/api/translate.googleapis.com/overview).

### Authentication

#### Option 1 - Add Translate permissions to an existing token

If you have already followed the steps for [Enabling Image Support](#enabling-image-support), then you will already have a JSON token and a `GOOGLE_APPLICATION_CREDENTIALS` environment variable that points to it. Locate the service account associated with the token [here](https://console.cloud.google.com/iam-admin/iam), and add the "Cloud Translation -> Cloud Translation API User" Role to the service account.

#### Option 2 - Create an authentication token with Translate Permissions

Follow the instructions [here](https://cloud.google.com/docs/authentication/getting-started) to create an authentication token and give it "Cloud Translation -> Cloud Translation API User" permissions.

Save the JSON token to disk and set its permissions to `644`.

```sh
chmod 644 /path/to/token.json
```

Configure the `GOOGLE_APPLICATION_CREDENTIALS` env var to the token's path.

```sh
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/token.json"
```

**Warning!!** Separate tokens for translation and image hosting is not currently supported. If you want both, you must follow Option 1 above.

### Usage

Once set up, translation buttons will appear on each TextCard, Section Header, and Profile Header, but _only when a second language is selected_. This second language must be selected and represents the target language for the translation.

Remember a few key points for translations:

- Translations cost [money](https://cloud.google.com/translate/pricing): $20 per 1,000,000 characters. For reference, this is about $4 per entire-OEC-site-translation per language. Be careful not to overuse it, especially with profile-wide translations.
- Translating **paves all content in the target language and replaces it**. There is currently no smart detection of whether secondary language content has been updated since the last ingest - it is a one-way blast.
- Translations currently only cover text content (subtitles, paragraphs, stats). They do not cover visualizations, formatters, or language-specific variables. The translation API should be considered a _starting point_ for the SEO-optimized prose of the page.

### Command Line Tool

```sh
Usage: npx canon-cms-translate <command> [args]

For language codes, see https://cloud.google.com/translate/docs/languages

*** Remember, the CMS server must be running! ***

Commands:
    help    Shows this information.
    run     Runs a translation operation
            - Required: target, profile
            - Optional: source, member

    If command is not set, "run" will be executed.

Arguments:
    -b, --base      The root url on which to run translations
    -h, --help      Shows this information.
    -m, --member    The slug of the sample member to use during translation (optional, ignored when profile=all)
    -p, --profile   The integer id for the the profile to translate
                    Use "all" to translate entire cms (be careful, this can be $ expensive)
    -s, --source    The source language to use for translation (optional, defaults to CANON_LANGUAGE_DEFAULT)
    -t, --target    The target language for translation.
```

Example usage:

```
npx canon-cms-translate -b http://localhost:3300 -p 1 -t es
```

### Notes

Similar to the CMS itself, translation should not be enabled on the production server. As such, the translation endpoint route itself will **not be registered** unless `NODE_ENV=development` or `CANON_CMS_ENABLE=true` (or both). Additionally, the translation route is placed behind the canon `isAuthenticated` middleware, so users must be logged in for translation to work.

---

## Command Line Reingest

When a user adds a dimension to a profile, the CMS communicates with Tesseract to ingest all relevant members into its search table. In the UI of the CMS, this list can be updated by clicking the reingest button for that dimension.

In some cases, this re-ingestion may need to occur on a more regular basis. For this, use the reingest command line tool.

### Env Vars

The script requires environment variables from the main installation to be in scope when the script is run. The best way is just to use all of them, but specifically, only these are required:

```
CANON_DB_NAME
CANON_DB_USER
CANON_DB_PW
CANON_DB_HOST
CANON_LANGUAGE_DEFAULT
CANON_LANGUAGES
CANON_CMS_CUBES
```

Your installation may require some more:

```
OLAP_PROXY_SECRET
CANON_CMS_MINIMUM_ROLE
```

You may want to set the following to `true` for additional debug data:

```
CANON_CMS_LOGGING
```

### Usage

Help command:

```sh
Canon CMS / Search Ingestion Script
Usage: npx canon-cms-ingest <command> [args]

Commands:
    help      Shows this information.
    list      List dimensions and ids
    run       Runs a search ingest
                - Required: dimension

Arguments:
    -d, --dimension   The dimension id to ingest
    -s, --slugs       Generate new slugs (warning: can update/break permalinks)
    -a, --all         Include members with null values for the given Measure (rarely used)
```

Example usage:

```
npx canon-cms-ingest run -d 1
```

### Notes

Ingests are performed on a _dimension_ level, not a profile one. For example, for a bilateral profile like product/country, there are single ids for each dimension (product and country). You can view a list of these by running `npx canon-cms-ingest list`. Then use the id found there to feed into the `-d` argument.

For the sake of permalinks, the ingest preserves slugs by default, even if the underlying data has changed its name. Use the `-s` switch to override this and generate slugs from scratch.

Additionally, the ingest script will not ingest any members who have a null value for the dimension's measure. Use the `-a` switch to override this and include all possible members, including null measures.

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
Usage: npx canon-cms-warmup [command] [args]

Available commands are "scan" and "list".
If the command is not set, the script will execute the "scan" command.

Commands:
    scan    The "scan" command checks the available pages in the available
            profiles, and run the tests on each page.
            It has 2 modes: the "run" mode and the "retry" mode. The presence
            of the --input argument determines which mode the script will run.
            In run mode, the script needs to connect to the database and
            retrieve the items the profiles are built with, then sets the
            additional parameters.
                Required : base, db[-props]
            In retry mode, the script will use the results.json file generated
            by a previous run. All the parameters were saved inside, so passing
            them again is not needed.
                Required : input
    list    The "list" command is a reduced version of the scan command.
            Instead of generating the URLs, loading, and executing tests on
            them, it just generates the URLs and saves them in a file.
            This file can later be used in other tools, like siege.
                Required : base, db[-props]

Arguments:
    -b, --base      The root url to use as template in the generation.
                    These variables will be replaced:
                    - ':profile' for the profile name
                    - ':page' for the page slug
    -d, --debug     Prints some extra variables for debugging purposes.
    -H, --header    Set a header for all requests. Multiple headers are allowed
                    but each must be preceeded by the flag, like in curl.
                    The 'Host' header can't be modified.
    -h, --help      Shows this information.
                    This parameter must be used once for each "key: value" combo.
    -i, --input     The path to the 'results.json' file of the previous run.
    -o, --output    The path to the folder where the reports will be saved.
                    Defaults to './cms_warmup_YYYYMMDDhhmmss'.
    -p, --password  The password in case of needing basic authentication.
        --profile   A comma-separated string with the profiles that should be loaded.
                    If omitted or empty, all available profiles will be used.
    -t, --timeout   Time limit to consider a page load failed, in seconds.
    -u, --username  The username in case of needing basic authentication.
        --db-host   The host and port where to connect to the database.
                    Defaults to "localhost:5432".
        --db-name   The name of the database where the info is stored.
        --db-user   The username to connect to the database.
        --db-pass   The password to connect to the database, if needed.
        --db        The full connection URI string to connect to the database.
                    Format is "engine://dbUser:dbPswd@dbHost/dbName".
                    If this variable is set, the previous ones are ignored.
    -w, --workers   The number of concurrent connections to work with. Default: 2
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

---

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
- [canon-cms@0.14.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.14.0)
- [canon-cms@0.15.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.15.0)
- [canon-cms@0.16.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.16.0)
- [canon-cms@0.17.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.17.0)
- [canon-cms@0.18.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.18.0)
- [canon-cms@0.19.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.19.0)
- [canon-cms@0.20.0](https://github.com/Datawheel/canon/releases/tag/%40datawheel%2Fcanon-cms%400.20.0)

---

## Migration

For upgrading to new versions, there are currently several migration scripts:

1. `npx canon-cms-migrate-legacy` (for DataUSA)
2. `npx canon-cms-migrate-0.1` (for CDC or other 0.1 CMS users)
3. `npx canon-cms-migrate-0.6` (for 0.6 CMS users)
4. `npx canon-cms-migrate-0.7` (for 0.7 CMS users)
5. `npx canon-cms-migrate-0.8` (for 0.8 CMS users)
6. `npx canon-cms-migrate-0.9` (for 0.9 CMS users, for upgrade to 0.11 ONLY)
7. `npx canon-cms-migrate-0.11` (for 0.10 or 0.11 CMS users, for upgrade to 0.12 ONLY)
8. `npx canon-cms-migrate-0.12` (for 0.12 CMS users)
9. `npx canon-cms-migrate-0.13` (for 0.13 CMS users)
10. `npx canon-cms-migrate-0.16` (for 0.14, 0.15, or 0.16 CMS users, for upgrade to 0.17, 0.18, 0.19, or 0.20)
11. `npx canon-cms-migrate-0.20` (for 0.17, 0.18, 0.19, or 0.20 CMS users, for upgrade to 0.21)

**Note:** Canon CMS Version 0.10.0 did **NOT** require a database migration, so the `0.9` script will output a `0.11` database.

**Note:** Unlike all other migrations, the `0.11` -> `0.12` migration script performs a total search re-ingest from the source cubes. This means that the following env vars MUST be set in the environment where are you running the migration, AND they must match your production credentials to ensure a proper ingest.

- `CANON_CMS_CUBES` - Required for connecting to the Cube
- `CANON_LANGUAGES` - Required for cube ingest so language data can be populated. Make sure this matches your prod setup!
- `CANON_LANGUAGE_DEFAULT` - Required for slug generation - slugs for search members are generated based on the default language.
- `CANON_CMS_LOGGING` - Not required, but recommended to turn on to observe the migration for any errors.

### Instructions

The name of the script represents the version you wish to migrate **FROM**. So, to upgrade a DB from 0.6 to 0.7, one would use `npx canon-cms-migrate-0.6`. Currently both `legacy` and `0.1` upgrade directly to `0.6`. From here on out, versions will upgrade **one dot version at a time** (exception: 0.9 to 0.11).

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

These variables represent the old db you are migration **from** and the new db you are migrating **to**. The new db will be **wiped every time** you run the script - the idea here is that you are building a new db from scratch.

🔥 WHATEVER DB YOU CONFIGURE AS **NEW** WILL BE COMPLETELY DESTROYED AND BUILT FROM SCRATCH 🔥
🔥 DO NOT SET `CANON_CMS_MIGRATION_NEW_DB_*` TO A CURRENTLY IMPORTANT DB🔥

After the migration is done, you can switch your dev environment to the new DB for testing, and eventually switch it to prod.


## Sitemaps

Google [loves](https://developers.google.com/search/docs/advanced/sitemaps/overview) sitemaps. They are the very first step to let search engines know about our pages and our conent. The indexation process will happen sooner or later but with sitemaps we speed up the whole round up.

### Automatic but not magic

Canon CMS generates sitemaps for your content automatically. But that is not enough, remember to [setup the prod site and submit](https://search.google.com/search-console) your sitemaps properly into Google Search Console.

### Prerequisites

- Your site needs `canon-cms` installed and working.

- Make sure that both `CANON_API` and `CANON_LANGUAGES` environmental variables are setted.

```bash
CANON_API="https://yoursite.com"
CANON_LANGUAGES="en,es"
```

- Add and fill your `canon.js` with the following structure:

```javascript
module.exports = {
  //... other canon.js configs
  sitemap: { // Main object
    paths: {  // profile and stories template, hast to match with your route for profiles. :lang could be ignored
      profiles: '/:lang/profile/:profile/:page',
      stories: '/:lang/story/:page'
    },
    rss: { // If your site has stories, a sitemap for blog posts will be generated. This information is required for generate the RSS version
      blogName: "My Datawheel blog",
      blogDescription: "It is a fantastic blog based on data."
    },
    // getMainPaths: you can provide canon-cms all your custom pages paths to be included in the sitemap. Default is ["/"]: the home page.
    getMainPaths: async (app) => {
      //You can run queries in here and return an array of paths
      return [
        "/",
        "/about",
        "/about/data",
        "/blog/es/super-post",
        "/blog/en/super-posteo",
        "/another/custom/thing"
      ]
    }
  },
  //... other canon.js configs
```

- That's all!

### Generated links

Canon CMS generates several sitemaps/endpoints for you, combining CMS and custom data and with i18n support.

**General Sitemap**

List and group all the generated sitemaps:

  - `/api/sitemap.xml`: Valid sitemap to submit, built following the definition to inform [multiples sitemaps](https://developers.google.com/search/docs/advanced/sitemaps/large-sitemaps) at once. All the other sitemaps are listed here. You can submit this file to Google and that's it.
  - `/api/sitemap.txt`: Informative url with all the links generated. Is not a valid sitemap.
  - `/api/sitemap.json`: Informative url with all the links generated with profiles ids and slugs. Not a valid sitemap.

**Main Sitemap**

Generate valid sitemaps for the urls listed in `getMainPaths` inside `canon.js`:

- `/api/sitemap/main.txt`: valid sitemap in TXT format.
- `/api/sitemap/main.xml`: valid sitemap in XML format.

**Stories Sitemap**

If your site has stories `canon-cms` generates the following endpoints:
- `/api/sitemap/stories.txt`: valid sitemap in TXT format.
- `/api/sitemap/stories.xml`: valid sitemap in XML format.
- `/api/sitemap/stories.rss`: valid RSS feed compatible with ATOM scheme.

**Profiles Sitemaps**

The most important sitemaps in the site. Per profile type, `canon-cms` creates a single sitemap with all the profile' urls.

- `/api/sitemap/profiles/<profileTypeId>.txt`: valid sitemap in TXT format.
- `/api/sitemap/profiles/<profileTypeId>.xml`: valid sitemap in XML format.

Example: `/sitemap/profiles/1.txt`, `/sitemap/profiles/7.xml`

NOTE: There is a limit of 50k urls per sitemap. Right now the list is truncated but the plan is to implement pagination to split the results when 50k urls limit is hitted.

### Usage

Submit `https://www.yoursite.com/api/sitemap.xml` to [Search Console](https://search.google.com/search-console) and let Google know all the information we have.
