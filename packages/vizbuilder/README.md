# vizbuilder

## Getting started

Install the package from [npm](https://www.npmjs.com/):

```bash
npm i @datawheel/canon-vizbuilder --save
```

Import it to your page:

```js
import Vizbuilder from "@datawheel/canon-vizbuilder";
```

## Basic setup

The minimal requirement for Vizbuilder is a mondrian-rest server URL.
To insert Vizbuilder in a page, you have to import the component and set it inside a page:

```jsx
import Vizbuilder from "@datawheel/canon-vizbuilder";

class MyPage extends React.PureComponent {
  ...
  render() {
    return (
      <section>
        <Vizbuilder src="https://your.mondrian-rest.server" />
      </section>
    );
  }
  ...
}

export default MyPage
```

Vizbuilder's state is managed from the site-wide redux state, so is a requirement to setup the Vizbuilder's reducer function.
In `app/reducers/index.js`, import the reducer function and assign it to the `vizbuilder` key:

```js
import {vbStateReducer} from "@datawheel/canon-vizbuilder";

...

export default {
  ...
  vizbuilder: vbStateReducer,
  ...
};
```

## Available properties

Most of these properties are only processed during the construction of the
Vizbuilder component, and changing them on further stages of their lifecycle
won't have any effect.

| Property          | Type                                          | Required? | Default value | Description |
| :---------------- | :-------------------------------------------- | :-------- | :------------ | :---------- |
| src               | `string`, `string[]`                          | ✓         |               | A mondrian-rest server URL, or an array of mondrian-rest server URLs. |
| config            | `D3plusConfigObject`                          |           | `{}`          | A d3plus chart config object. This object is combined and passed to all charts displayed by Vizbuilder. See the [Chart configuration](#chart-configuration) section for details. |
| datacap           | `number`                                      |           | `20000`       | The amount of data points Vizbuilder should be allowed to handle as a result of a query. A value too high could freeze the browser. |
| defaultGroup      | `string[]`                                    |           |               | An array with names of the Level that should be selected by default after a Measure is selected. The order of the strings determines which Level will be picked first. |
| defaultMeasure    | `string`                                      |           |               | The name of the measure that should be loaded when Vizbuilder is rendered for the first time. |
| formatting        | `{[x: string], (d: number) => string}`        |           | `{}`          | An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement) names, and their values are functions that accept a number argument and return an string with the formatted value. There's a list of [default formatters](https://github.com/Datawheel/canon/blob/master/packages/vizbuilder/src/helpers/formatting.js#L6), but if there's no match, [`d3plus-format.formatAbbreviate`](https://github.com/d3plus/d3plus-format/blob/master/src/abbreviate.js) is used instead. |
| measureConfig     | `{[x: string], D3plusConfigObject}`           |           |               | An object, whose keys are Measure names, and their values are d3plus chart config objects. These are specific configurations for each Measure, and take priority over the configurations set in the `config` property. |
| multipliers       | `{[x: string], number}`                       |           | `{}`          | An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement) names, and their values are numbers. These are used in Filters for conversion of the input value to the real value represented and backwards. See [Issue #325](https://github.com/Datawheel/canon/issues/325) for details. |
| onChange          | `(query: VbQuery, charts: VbChart[]) => void` |           | `() => void`  | A hook function called afted the internal State is modified. Useful to extract the state and prepare features outside of Vizbuilder's scope. The parameters this function receives must be considered as READ-ONLY objects; modifying them could have uncertain consequencies. |
| permalink         | `boolean`                                     |           | `true`        | The switch that enables or disables permalinks on the current instance. See [Using Permalinks](#using-permalinks) for details. |
| permalinkKeywords | `{[x: string], string}`                       |           |               | An object to configure the parameter names to parse from/to the URL.search string. See [Using Permalinks](#using-permalinks) for details. |
| toolbar           | `JSX.Element`                                 |           |               | A component to render just above the chart area. Can be used to put a custom toolbar inside the Vizbuilder. See [Styling](#styling) for a reference of the position. |
| topojson          | `{[x: string], D3plusTopojsonConfigObject}`   |           | `{}`          | An object, whose keys are Geographic Level names, and their values are d3plus chart config objects, restricted to topojson-related properties. These are only applied on geomap charts. See [Chart configuration](#chart-configuration) for details. |
| visualizations    | `string[]`                                    |           | `["geomap", "treemap", "barchart", "lineplot", "barchartyear", "stacked"]` | An array of the type of charts allowed to be rendered. There's some changes to the Vizbuilder internal working if this array only contains `"geomap"`, see [Map-only mode](#map-only-mode) for details. |

Additionally, Vizbuilder accepts childrens. These will be rendered between the Filter Manager and the Ranking, on the Sidebar area. See [Styling](#styling) for a quick reference.

### Interfaces referenced

- `D3plusConfigObject`: `{[x: string]: any}`
  For this object, `x` must be a valid key to define a configuration property in a d3plus chart. See the [d3plus documentation](https://d3plus.org/docs/) for further reference.
- `D3plusTopojsonConfigObject`: `{[x: string]: any}`
  The same as with `D3plusConfigObject`, but in this case, `x` should only be topojson-related properties. Some examples are `topojson` (required, the URL to the topojson file), `topojsonId` (the key that relates each topojson shape with the dataset value), and `topojsonKey` (the key in the topojson file for the shapes to use). See the [d3plus documentation on Geomaps](https://d3plus.org/docs/#Geomap.topojson) for further reference.
- `VbQuery`: `{[x: string]: any}`
  The main query state for the Vizbuilder. This is the basic state from where all queries are calculated.
- `VbChart`: `{[x: string]: any}`
  The list of charts currently rendered in Vizbuilder. Each object contains the specific query (a specific expansion of the VbQuery object), the dataset shown, and the extra properties used to create each chart.

## Chart configuration

The configuration objects are split in different properties to apply them according to the specific situation.
The final configuration object that will be passed to each d3plus chart component is generated from a combination of these objects in this order:

1. A common internal base configuration object.
2. A chart-specific configuration object, made for the relevant `VbChart.query`.
3. If a geographic level is set, the level-specific topojson configuration set in `topojson[geolevel.name]`.
4. The general configuration object from `config`.
5. The measure-specific configuration set in `measureConfig[measure.name]`.

All these are combined using `d3plus-common.assign`, so the combination is deep, and each object overrides the properties set by the previous one.

## Using permalinks

Permalinks are enabled by default. To disable them, you must set the `permalink` property to `false`.
You could also disable the internal permalinks and use the `onChange` hook to setup your own implementation.

### Structure

| Keyword    | Format                                                                             | Example         | Description |
| :--------- | :--------------------------------------------------------------------------------- | :-------------- | :---------- |
| `enlarged` | `[VbChart.type]`-`[VbChart.key]`                                                   | `treemap-z9TnC` | Defines if a chart should be zoomed in when it finishes loading. |
| `filters`  | `[order]`-`[Filter.measure.key]`-`[Filter.operator]`-`[Filter.value]`              | `0-1qWfo-1-1`   | Determines the filters that should be set. Can be set multiple times in the permalink. |
| `groups`   | `[order]`-`[Grouping.level.key]`-`[Grouping.member.key]?`~`[Grouping.member.key]?` | `0-z9TnC-04000US08~04000US09` | Determines the groupings that should be set. Can be set multiple times in the permalink. |
| `measure`  | `[Measure.annotations.key]`                                                        | `1qWfo`         | Determines which measure should be selected on the first load. |

Following the examples in the table, a permalink should look like this:
```
https://data.site/vizbuilder?enlarged=treemap-z9TnC&filters=0-1qWfo-1-1&groups=0-z9TnC-04000US08~04000US09&groups=1-1cDpEA&measure=1qWfo
```

To define your own structure, pass an object like this one to the `permalinkKeywords` property:

```js
{
  "enlarged": "show",
  "filters": "f",
  "groups": "g",
  "measure": "m"
}
```

This would change the previous permalink to:
```
https://data.site/vizbuilder?show=treemap-z9TnC&f=0-1qWfo-1-1&g=0-z9TnC-04000US08~04000US09&g=1-1cDpEA&m=1qWfo
```

To prevent reliability issues, the `permalinkKeywords` property is only incorporated
during the construction of the Vizbuilder component, and any further attempt to
change its properties will have no effect.

## Map-only mode

Setting the `visualizations` property to `["geomap"]` has the following effects on the Vizbuilder:

- The .vizbuilder main wrapper gets the `.mapmode` className.
- Hides a measure if its parent cube's dimensions doesn't have at least one level with a defined `topojson` configuration.
- Only an instance of d3plus.geomap is rendered, always enlarged.
- Only a single grouping is allowed, and must be geographic.
- Hides any non-geographic Level from the list of Groupings, and hides the geographic Levels which don't have a defined `topojson` configuration.

This is also a initialization-dependent property.

## Styling

The styling included in Vizbuilder is minimal, but the skeleton has some predefined
sizings. It's preset to have a height of 100vh, a sidebar of 300px, a chart space
that uses the remaining space with a minimal width of 400px; both areas set to have
automatic scrollbars if their content is taller than the window height, and so on.
To facilitate the styling of the different parts of the interface, there are some
useful classnames tied to the structure:

```
.vizbuilder[.loading]
  [`components/Loading.jsx` is rendered here, but only shown during `.vizbuilder.loading`]
  .area-sidebar
    .wrapper
      .control.measure-manager
      .control.grouping-manager
      .control.filter-manager
      [`this.props.children` are rendered here, is suggested they have the `.control` className]
      .control.ranking
      .control.sources
  .area-chart
    [.wrapper.toolbar, depending if `this.props.toolbar` is set]
      [`this.props.toolbar` is rendered here]
    .wrapper.chart-wrapper[.multi/.single][.unique]
      [.chart-card for each chart]
        .wrapper
          .viz
          footer
```
