import {MiddlewareAPI, Dispatch, AnyAction} from "redux";

import {D3plusConfig} from "./types/d3plus";

export function vizbuilderReducer(state: any, action: any): any;

export function vizbuilderMiddleware({
  dispatch,
  getState
}: MiddlewareAPI<Dispatch<AnyAction>, GeneralState>): (
  next: Dispatch<AnyAction>
) => (action: AnyAction) => any;

export declare class Vizbuilder extends React.Component<VizbuilderProps, any> {}

export interface VizbuilderProps {
  /**
   * The source for the cubes to visualize.
   * An OLAP server URL, or an array of OLAP server URLs.
   */
  src: string | string[];

  /**
   * A d3plus chart config object.
   * This object is combined and passed to all charts displayed by Vizbuilder.
   */
  config?: Partial<D3plusConfig>;

  /**
   * The amount of data points Vizbuilder should be allowed to handle as a
   * result of a query. A value too high could freeze the browser.
   * Default is 20000.
   */
  datacap?: number;

  /**
   * An array with names of the Level that should be selected by default after
   * a Measure is selected. The order of the strings determines which Level will
   * be picked first.
   */
  defaultGroup?: string[];

  /**
   * The name of the measure that should be loaded when Vizbuilder is rendered
   * for the first time.
   */
  defaultMeasure?: string;

  /**
   * After picking the default measure, if the measure's cube belongs to a table,
   * this function let's the user pick the cube the measure will be used from.
   */
  defaultTable?: (cubes: CubeItem[]) => CubeItem;

  /**
   * An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement)
   * names, and their values are functions that accept a number argument and
   * return an string with the formatted value. There's a list of [default formatters](https://github.com/Datawheel/canon/blob/master/packages/vizbuilder/src/helpers/formatting.js#L6),
   * but if there's no match, [`d3plus-format.formatAbbreviate`](https://github.com/d3plus/d3plus-format/blob/master/src/abbreviate.js)
   * is used instead.
   */
  formatting?: Record<string, (d: number) => string>;

  /**
   * In case the site has more than one instance of Vizbuilder (like a full
   * view + a map mode view), the instances must have a `instanceKey` to reset
   * the general state and not have interference between views.
   * See [Multiple instances](#multiple-instances) on the Readme for details.
   */
  instanceKey?: string;

  /**
   * The language to show the data to the user, in ISO 639-1 format.
   * Defaults to "en".
   */
  locale: string;

  /**
   * An object, whose keys are Measure names, and their values are d3plus chart
   * config objects. These are specific configurations for each Measure, and
   * take priority over the configurations set in the `config` property.
   */
  measureConfig?: {[key: string]: Partial<D3plusConfig>};

  /**
   * TODO: resolve an implementation
   */
  measureUnitConfig?: Record<string, (chart: Chart, uiParams: any) => Partial<D3plusConfig>>;

  /**
   * An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement)
   * names, and their values are numbers. These are used in Filters for
   * conversion of the input value to the real value represented and backwards.
   * Keys are case sensitive.
   * See [Issue #325](https://github.com/Datawheel/canon/issues/325) for details.
   */
  multipliers?: Record<string, number>;

  /**
   * A hook function called afted the internal State is modified. Useful to
   * extract the state and prepare features outside of Vizbuilder's scope. The
   * parameters this function receives must be considered as *READ-ONLY* objects;
   * modifying them could have uncertain consequencies.
   */
  onChange?(query: QueryState, charts: Chart[]): void;

  /**
   * The switch that enables or disables permalinks on the current instance.
   * See [Using Permalinks](#using-permalinks) on the Readme for details.
   */
  permalink?: boolean;

  /**
   * An object to configure the parameter names to parse from/to the URL.search string.
   * See [Using Permalinks](#using-permalinks) on the Readme for details.
   */
  permalinkKeywords?: Partial<PermalinkKeywordMap>;

  /**
   * A function to select the default measure to use in case it belongs to a table.
   * The function receives an array ob cubes, and must return one of them.
   */
  tableLogic?: (cubes: CubeItem[]) => CubeItem;

  /**
   * An object, whose keys are Geographic Level names, and their values are
   * d3plus chart config objects, restricted to topojson-related properties.
   * These are only applied on geomap charts.
   * See [Chart configuration](#chart-configuration) for details.
   */
  topojson?: Record<string, TopojsonConfig>;

  /**
   * An array of the allowed chart types to show in this instance.
   * Available options are "geomap", "treemap", "barchart", "lineplot", "barchartyear", and "stacked".
   * If the only chart allowed is "geomap", vizbuilder will run in [Map-only mode](https://github.com/Datawheel/canon/tree/master/packages/vizbuilder#map-only-mode).
   */
  visualizations?: (
    | "barchart"
    | "barchartyear"
    | "donut"
    | "geomap"
    | "histogram"
    | "lineplot"
    | "pie"
    | "stacked"
    | "treemap")[];

  /**
   * This parameter will be rendered in the sidebar, between filters and source info.
   */
  controlsArea?: JSX.Element;

  /**
   * This parameter will be rendered in the sidebar, between source info and rankings.
   */
  sourcesArea?: JSX.Element;

  /**
   * This parameter will be rendered in the sidebar, before the measure selector.
   */
  titleArea?: JSX.Element;

  /**
   * This parameter will be rendered at the top of the chart area.
   */
  toolbarArea?: JSX.Element;
}
