import Measure from 'mondrian-rest-client/lib/types/measure';
import { Cube } from 'mondrian-rest-client';
import Dimension, { Level } from 'mondrian-rest-client/lib/types/dimension';

interface VCentralState {
  loading: LoadState;
  items: ItemsState;
  query: QueryState;
  dataset: Array<any>;
}

interface LoadState {
  loading: boolean;
  loadTotal: number;
  loadCurrent: number;
}

interface ItemsState {
  cubes: Array<Cube>;
  measures: Array<Measure>;
  dimensions: Array<Dimension>;
}

interface QueryState {
  cube: Cube;
  measure: Array<Measure>;
  drilldown: Array<Level>;
  filter: Array<Filter>;
}

interface Filter {

}
