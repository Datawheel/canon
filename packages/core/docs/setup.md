# @datawheel/canon-core

## Setup

### Installation

Canon is published on NPM, and should be installed just like any other node package. After creating a package.json file (try `npm init`), install Canon like this:

```bash
npm i @datawheel/canon-core
```

Once installed, run the following command to create some initial scaffolding:

```bash
npx canon-setup
```

Now that the necessary files are in place, simply run `npm run dev` to spin up the development server. Once the process finished "Bundling Client Webpack", visit `https://localhost:3300` in the browser and view your beautiful Hello World!

All React components are stored in the `app/` directory, with the main entry component being `app/App.jsx`. Here is the initial scaffolding you should see in your project folder:
* `.vscode/` - VSCode editor settings for code linting
* `app/` - majority of the front-end site code
  * `components/` - components that are used by multiple pages
  * `pages/` - page-specific components (like the homepage and profiles)
  * > `reducers/` - any redux reducers needed for the react-redux store (required to exist, but unused initially)
  * `App.jsx` & `App.css` - the main parent component that all pages extend
  * `d3plus.js` - global d3plus visualization styles
  * `helmet.js` - default meta information for all pages to be displayed between the `<head>` tags
  * `routes.jsx` - hook ups for all of the page routes
  * > `store.js` - default redux store (required to exist, but unused initially)
  * `style.yml` - global color and style variables
* `static/` - static files used by the site like images and PDFs
* `.eslintrc` - javascript style rules used for consistent coding
* `.gitignore` - development files to exclude from the git repository
* `canon.js` - contains any canon settings/modifications (empty by default)

### Deployment

Deploying a site with canon is as easy as these 2 steps:

* `npm run build` to compile the necessary production server and client bundles
* `npm run start` to start an Express server on the default port
