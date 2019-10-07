interface Dataset {
  data: any[];
  formatter: (d: number) => string;
  params: QueryParams;
}

interface Chart extends Dataset {
  chartType: string;
}

interface QueryParams {
  collection: MeasureItem;
  cube: CubeItem;
  filters: FilterItem[];
  geoLevel: LevelItem;
  groups: GroupItem[];
  lci: MeasureItem;
  measure: MeasureItem;
  moe: MeasureItem;
  source: MeasureItem;
  timeLevel: LevelItem;
  uci: MeasureItem;
}

enum Comparison {
  EQ = "=",
  GT = ">",
  GTE = ">=",
  LT = "<",
  LTE = "<=",
  NEQ = "!="
}

interface VbDatagroup {
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

interface VbChart extends VbDatagroup {
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
