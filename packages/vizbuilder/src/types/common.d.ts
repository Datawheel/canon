type ChartType =
  | "barchart"
  | "barchartyear"
  | "donut"
  | "geomap"
  | "histogram"
  | "lineplot"
  | "pie"
  | "stacked"
  | "treemap";

interface Datagroup {
  dataset: any[];
  hasTopojsonConfig: boolean;
  memberCount: Record<string, number>;
  memberList: Record<string, any[]>;
  params: QueryParams;
  visualizations: ChartType[];
}

interface Chart {
  chartType: ChartType;
  data: any[];
  isTopTen?: boolean;
  key: string;
  members: Record<string, number[] | string[]>;
  params: QueryParams;
}

interface QueryParams {
  /** Collection measure. */
  collection?: MeasureItem;

  /** Parent cube of all the items in this object. */
  cube: CubeItem;

  cuts: Record<string, string[]>;

  /** All levels used in the query. */
  drilldowns: LevelItem[];

  /** All filters set directly by the user. */
  filters: FilterItem[];

  /** The first geographic-type level found in the current cube. */
  geoLevel?: LevelItem;

  /** All groups set directly by the user. */
  groups: GroupItem[];

  /** The level items for each group, in the same order. */
  levels: LevelItem[];

  /** The Lower Confidence Interval measure for the current measure. */
  lci?: MeasureItem;

  /** The measure set directly by the user. */
  measure: MeasureItem;

  /** Margin of error measure for the current measure. */
  moe?: MeasureItem;

  source?: MeasureItem;

  /** The first time-type level found in the current cube. */
  timeLevel?: LevelItem;

  /** The Upper Confidence Interval measure for the current measure. */
  uci?: MeasureItem;
}

interface DimensionLike {
  name: string;
  hierarchies: HierarchyLike[];
}

interface HierarchyLike {
  name: string;
  dimension: string;
  levels: LevelLike[];
}

interface LevelLike {
  dimension: string;
  hierarchy: string;
  name: string;
}

interface LevelRef {
  dimension: string;
  hierarchy: string;
  level: string;
}

interface PermalinkKeywordMap {
  measure: string;
  groups: string;
  filters: string;
  enlarged: string;
  confint: string;
  period: string;
}
