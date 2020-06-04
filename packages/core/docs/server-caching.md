# @datawheel/canon-core

## Server-Side Caching

Some projects benefit by creating a server-side data cache to be used in API routes (for example, metadata about cube dimensions). Canon imports all files present in the top level `cache/` directory, and stores their return contents in `app.settings.cache` based on their filename. For example, to store the results of an API request in the cache, you could create the following file at `cache/majors.js`:

```js
const axios = require("axios");

module.exports = function() {

  return axios.get("https://api.datausa.io/attrs/cip/")
    .then(d => d.data);

};
```

The results of this promise can then be used in an API route:

```js
module.exports = function(app) {

  const {cache} = app.settings;

  app.get("/api/cache/majors", (req, res) => {

    res.json(cache.majors).end();

  });

};
```
