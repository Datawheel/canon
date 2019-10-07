interface GeneralState {
  vizbuilder: VizbuilderState;
}

interface VizbuilderState {
  charts: Chart[];
  cubes: CubeItem[];
  instance: InstanceState;
  loading: LoadingState;
  query: QueryState;
}

interface LoadingState {
  inProgress: boolean;
  total: number;
  done: number;
  error: Error | undefined;
}

interface QueryState {
  activeChart: string | null;
  groups: GroupItem[];
  filters: FilterItem[];
  measure: string;
  showConfInt: boolean;
  timePeriod: number | null;
}

interface InstanceState {
  datacap: number;
  defaultGroup?: string[];
  defaultMeasure?: string;
  key: string;
  multipliers: {[key: string]: number};
  permalink: boolean;
  permalinkKeys?: {
    enlarged: string;
    filters: string;
    groups: string;
    measure: string;
  };
  topojson: string[];
  visualizations: string[];
}
