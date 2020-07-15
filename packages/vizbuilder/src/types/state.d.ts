interface GeneralState {
  auth: any;
  data: any;
  env: any;
  i18n: any;
  legal: any;
  loading: any;
  loadingProgress: any;
  location: any;
  mailgun: any;
  routing: any;
  social: any;
  instances: any;
  vizbuilder: VizbuilderState;
}

interface VizbuilderState {
  charts: ChartsState;
  cubes: CubesState;
  instance: InstanceState;
  loading: LoadingState;
  query: QueryState;
}

type ChartsState = Chart[];

type CubesState = Record<string, CubeItem>;

interface LoadingState {
  done: number;
  errorMsg: string | undefined;
  errorName: string | undefined;
  inProgress: boolean;
  total: number;
}

interface QueryState {
  activeChart: string | null;
  groups: Record<string, GroupItem>;
  filters: Record<string, FilterItem>;
  measure: string;
  showConfInt: boolean;
  timePeriod: number | null;
}

interface InstanceState {
  datacap: number;
  defaultGroup?: LevelLike[];
  defaultMeasure?: string;
  key: string;
  locale: string;
  multipliers: Record<string, number>;
  permalink: boolean;
  permalinkConfint: string;
  permalinkEnlarged: string;
  permalinkFilters: string;
  permalinkGroups: string;
  permalinkMeasure: string;
  permalinkPeriod: string;
  topojson: string[];
  visualizations: (
    | "barchart"
    | "barchartyear"
    | "donut"
    | "geomap"
    | "histogram"
    | "lineplot"
    | "pie"
    | "stacked"
    | "treemap")[];
}
