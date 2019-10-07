interface CubeItem {
  caption: string;
  crosswalkDimensions: string[];
  datasetHref: string;
  datasetName: string;
  dimensions: DimensionItem[];
  dimNames: string[];
  hideInMap: boolean;
  hideInUi: boolean;
  key: string;
  measures: MeasureItem[];
  name: string;
  server: string;
  sourceDescription: string;
  sourceHref: string;
  sourceName: string;
  subtopic: string;
  tableId: string;
  topic: string;
  uri: string;
}

interface DimensionItem {
  caption: string;
  cube: string;
  defaultHierarchy: string | undefined;
  defaultYear: number | undefined;
  hideInMap: boolean;
  hideInUi: boolean;
  hierarchies: HierarchyItem[];
  isCrosswalk: boolean;
  isRequired: boolean;
  key: string;
  levelCount: number;
  name: string;
  server: string;
  type: string;
  uri: string;
}

interface FilterItem {
  inputtedValue: string;
  interpretedValue: number;
  key: string;
  measure: string;
  operator: Comparison;
}

interface GroupItem {
  dimension: string;
  hierarchy: string;
  key: string;
  level: string;
  members: string[];
}

interface HierarchyItem {
  caption: string;
  cube: string;
  dimension: string;
  hideInMap: boolean;
  hideInUi: boolean;
  key: string;
  levels: LevelItem[];
  name: string;
  server: string;
  uri: string;
}

interface LevelItem {
  caption: string;
  cube: string;
  dimension: string;
  hideInMap: boolean;
  hideInUi: boolean;
  hierarchy: string;
  key: string;
  name: string;
  server: string;
  uri: string;
}

interface MeasureItem {
  aggregationType: string;
  caption: string;
  cube: string;
  datasetHref: string;
  datasetName: string;
  defaultGroup: string | undefined;
  details: string;
  dimNames: string[];
  hideInMap: boolean;
  hideInUi: boolean;
  isCollectionFor: string | undefined;
  isLCIFor: string | undefined;
  isMOEFor: string | undefined;
  isSourceFor: string | undefined;
  isUCIFor: string | undefined;
  key: string;
  name: string;
  searchIndex: string;
  server: string;
  sortKey: string;
  sourceHref: string;
  sourceName: string;
  subtopic: string;
  tableId: string | undefined;
  topic: string;
  unit: string;
  uri: string;
}

interface MemberItem {
  key: string | number;
  name: string;
  ancestors: MemberItem[];
  children: MemberItem[];
}
