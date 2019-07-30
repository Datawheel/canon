import * as React from "react";
import { Cube, Level, Measure } from "mondrian-rest-client";
import Member from "mondrian-rest-client/lib/types/member";
import { Datagroup } from "./helpers/chartCriteria";

export function vbStateReducer(state: any, action: any): any;

declare class Grouping {
  private uuid: string;
  public level: Level;
  public members: Member[];

  public key?: string;
  public name?: string;
  public hasMembers: boolean;

  static isValid(grouping: Grouping): boolean;
  static isValidCut(grouping: Grouping): boolean;

  public toString(): string;
  public serialize(): string;
  public getClone(): Grouping;
  public setLevel(level: Level): Grouping;
  public addMember(member: Member): Grouping;
  public removeMember(member: Member): Grouping;
}

declare class Filter {
  private uuid: string;
  public measure: Measure;
  public operator: number;
  public value: number;
  public visibleValue: string | number;

  public key: string;
  public name: string;
  public operatorLabel: string;
  public hasValue: boolean;

  public toString(): string;
  public serialize(): string;
  public getClone(): Filter;
  public getFormatter(): (d: number) => string;
  public getMultiplier(): number;
  public setMeasure(measure: Measure): Filter;
  public setOperator(evt: Event): Filter;
  public setValue(valueAsNumber: number, valueAsString: string): Filter;
}

declare class Vizbuilder extends React.Component<VizbuilderProps, any> {}

export interface VizbuilderProps {
  /** The source for the cubes to visualize. A mondrian-rest server URL, or an array of mondrian-rest server URLs. */
  src: string | string[];

  /** A d3plus chart config object. This object is combined and passed to all charts displayed by Vizbuilder. */
  config?: D3plusConfigObject;

  /** The amount of data points Vizbuilder should be allowed to handle as a result of a query. A value too high could freeze the browser. Default is 20000. */
  datacap?: number;

  /** An array with names of the Level that should be selected by default after a Measure is selected. The order of the strings determines which Level will be picked first. */
  defaultGroup?: string[];

  /** The name of the measure that should be loaded when Vizbuilder is rendered for the first time. */
  defaultMeasure?: string;

  /** An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement) names, and their values are functions that accept a number argument and return an string with the formatted value. There's a list of [default formatters](https://github.com/Datawheel/canon/blob/master/packages/vizbuilder/src/helpers/formatting.js#L6), but if there's no match, [`d3plus-format.formatAbbreviate`](https://github.com/d3plus/d3plus-format/blob/master/src/abbreviate.js) is used instead. */
  formatting?: {[key: string]: (d: number) => string};

  /** In case the site has more than one instance of Vizbuilder (like a full view + a map mode view), the instances must have a `instanceKey` to reset the general state and not have interference between views. See [Multiple instances](#multiple-instances) on the Readme for details. */
  instanceKey?: string;

  /** An object, whose keys are Measure names, and their values are d3plus chart config objects. These are specific configurations for each Measure, and take priority over the configurations set in the `config` property. */
  measureConfig?: {[key: string]: D3plusConfigObject};

  /** An object, whose keys are [`Measure.annotations.units_of_measurement`](https://github.com/Datawheel/company/wiki/Data-Cube-Annotations#suggested-units-of-measurement) names, and their values are numbers. These are used in Filters for conversion of the input value to the real value represented and backwards. See [Issue #325](https://github.com/Datawheel/canon/issues/325) for details. */
  multipliers?: {[key: string]: number};

  /** A hook function called afted the internal State is modified. Useful to extract the state and prepare features outside of Vizbuilder's scope. The parameters this function receives must be considered as *READ-ONLY* objects; modifying them could have uncertain consequencies. */
  onChange?(query: VbQuery, charts: VbChart[]): void;

  /** The switch that enables or disables permalinks on the current instance. See [Using Permalinks](#using-permalinks) on the Readme for details. */
  permalink?: boolean;

  /** An object to configure the parameter names to parse from/to the URL.search string. See [Using Permalinks](#using-permalinks) on the Readme for details. */
  permalinkKeywords?: {[key: string]: string};

  /** A component to render just above the chart area. Can be used to put a custom toolbar inside the Vizbuilder. See [Styling](#styling) for a reference of the position. */
  toolbar?: JSX.Element;

  /** An object, whose keys are Geographic Level names, and their values are d3plus chart config objects, restricted to topojson-related properties. These are only applied on geomap charts. See [Chart configuration](#chart-configuration) for details. */
  topojson?: {[key: string]: D3plusTopojsonConfigObject};

  /** An array of the allowed chart types to show in this instance. Available options are "geomap", "treemap", "barchart", "lineplot", "barchartyear", and "stacked". Only allowing "geomap" charts enables the Map-only mode, see README.md (Map-only mode) for details. */
  visualizations?: string[];
}

export interface VbState {
  charts: VbChart[];
  datagroups: Datagroup[];
  instanceKey: string;
  load: VbLoadState;
  options: VbOptions;
  query: VbQuery;
  uiParams: VbUIParams;
}

export interface VbDatagroup {
  aggType: string;
  charts: string[];
  dataset: any[];
  formatter: (d: number) => string;
  key: string;
  members: {[key: string]: string[] | number[]};
  names: {[key: string]: string};
  query: VbQuery;
  quirk: string;
}

export interface VbChart implements VbDatagroup {
  aggType: string;
  baseConfig: Partial<D3plusConfigObject>;
  chartType: string;
  charts: string[];
  component: React.Component;
  dataset: any[];
  formatter: (d: number) => string;
  key: string;
  members: {[key: string]: string[] | number[]};
  names: {[key: string]: string};
  query: VbQuery;
  setup: Level[];
  topoConfig: {projection: string; ocean: string; topojson: string};
  userConfig: Partial<D3plusConfigObject>;
}

export interface VbQuery {
  measure: Measure;
  groups: Grouping[];
  filters: Filter[];
  cube: Cube;
  timeLevel: Level;
  lci?: Measure;
  uci?: Measure;
  moe?: Measure;
  source: string;
  collection: string;
}

export interface VbUIParams {
  activeChart: string | null;
  selectedTime: number | null;
  showConfidenceInt: boolean;
}

export default Vizbuilder;
