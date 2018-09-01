# Canon Logic Layer

The Canon Logic Layer is a REST API that simplifies queries to a mondrian cube using shorthand and introspective logic. This documentation contains installation instructions, basic usage examples, and explanations of the custom logic and settings that can be provided through the `canon.js` file in the root directory of a project.

#### Contents
* [Installation](#installation)
* [Usage](#usage)
* [Reserved Keywords](#reserved-keywords)
* [Cuts](#cuts)
* [Aliases](#aliases)
* [Custom Cube Filtering](#custom-cube-filtering)

___

## Installation

```bash
npm i @datawheel/canon-logiclayer
```

Additionally, an environment variable must be set to tell the logic layer which mondrian cube to use. For example, this would hook into the Data USA cube:

```bash
export CANON_LOGICLAYER_CUBE=https://canon-api.datausa.io/
```

___

Once the package has been installed on any site using `@datawheel/canon-core`, and the `CANON_LOGICLAYER_CUBE` environment variable has been set, the canon core server will automatically hook up the necessary cache and api routes for the logic layer.

___

## Usage

The logic layer exposes an endpoint at `/api/data` that will return JSON based on a series of query arguments. As simple example, using the Data USA cube, this endpoint would return population data for Massachusetts:

```bash
/api/data?measures=Total Population&State=04000US25
```

```json
{
  "data": [{
      "ID Year": 2016,
      "Year": "2016",
      "ID State": "04000US25",
      "State": "Massachusetts",
      "Total Population": 6811779
    },
    {
      "ID Year": 2015,
      "Year": "2015",
      "ID State": "04000US25",
      "State": "Massachusetts",
      "Total Population": 6794422
    },
    {
      "ID Year": 2014,
      "Year": "2014",
      "ID State": "04000US25",
      "State": "Massachusetts",
      "Total Population": 6745408
    },
    {
      "ID Year": 2013,
      "Year": "2013",
      "ID State": "04000US25",
      "State": "Massachusetts",
      "Total Population": 6692824
    }
  ],
  "source": [{
    "measures": [
      "Total Population"
    ],
    "annotations": {
      "source_name": "Census Bureau",
      "source_link": "http://www.census.gov/programs-surveys/acs/",
      "dataset_name": "ACS 1-year Estimate",
      "table_id": "B01003"
    },
    "name": "acs_yg_total_population_1",
    "substitutions": []
  }]
}
```

___

## Reserved Keywords

|keyword|description|default|
|---|---|---|
|`drilldowns`|A comma-separated list of drilldowns that should match to a level in a dimension.|`""`|
|`limit`|If defined, will only return the first X results.|`""`|
|`measures`|A comma-separated list of measure names to return. This is the only required keyword, and is used as the basis to determine which cubes should be queried.|`""`|
|`order`|The variable on which to order the final JSON results.|`"Year"`|
|`parents`|A boolean value, which determines whether or not to return the dimension parents from the query.|`"false"`|
|`properties`|A comma-separated list of properties to fetch for the provided dimensions.|`""`|
|`sort`|The sort direction for the `order` property. Can be either `"desc"` or `"asc"`|`"desc"`|
|`Year`|Which years to return from the database. In addition to supported comma-separated values (ie. `"2015,2016"`), there is also a preset list of shorthands: `"latest"`, `"previous"`, `"oldest"`, `"all"`|`"all"`|

___

## Cuts

Any keyword argument that is not recognized from the above list is considered a cut, and will be treated as such. In the Data USA example above, the `State=04000US25` is cutting the `State` dimension on the ID `04000US25`.

___

## Aliases

In addition to the reserved words, the `canon.js` file in the root directory of your project can contain a list of aliases to use for any keyword. For example, this config allows the new Data USA api to retain some of the legacy naming conventions from the old api:

```js
module.exports = {
  logiclayer: {
    aliases: {
      "CIP": "cip",
      "Geography": "geo",
      "measures": ["measure", "required"],
      "PUMS Industry": "naics",
      "PUMS Occupation": "soc",
      "University": "university",
      "Year": "year"
    }
  }
};
```

___

## Custom Cube Filtering

When determining which cubes to use for specific variables, there may be multiple cubes that match a given criteria. By default, the logic layer will simply select the first cube in an alpha-sorted array by cube name. If custom logic is needed, this logic cna be defined in the `canon.js` configuration file.

For example, the Data USA cube contains tables for ACS 1-year estimates and 5-year estimates, with the estimate year ending the table name (ie. `*_5` and `*-1`). A cube filter consists of 2 parts: a `key` function to group the table for inspection, and a `filter` function that returns the correct cube. Filters will be chained sequentially based on their order in the `Array` set on `cubeFilters`. This example uses a custom cache (passed as the third argument) in order to chose the table pased on the requested locations population.

```js
const d3Array = require("d3-array");

module.exports = {
  logiclayer: {
    cubeFilters: [
      {
        filter: (cubes, query, caches) => {
          const {pops} = caches;
          const ids = d3Array.merge(query.dimensions
            .filter(d => d.dimension === "Geography")
            .map(d => d.id));
          const bigGeos = ids.every(g => pops[g] && pops[g] >= 250000);
          return cubes.filter(cube => cube.name.match(bigGeos ? /_1$/g : /_5$/g));
        },
        key: cube => cube.name.replace(/_[0-9]$/g, "")
      }
    ]
  }
};
```
