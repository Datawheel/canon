import {DimensionType as DimType} from "@datawheel/olap-client";
import {unique} from "shorthash";
import yn from "yn";
import {ensureArray} from "./arrays";
import {Comparison} from "./enums";

/**
 * Creates the base structured object for a vizbuilder cube
 * @param {import("@datawheel/olap-client").Cube} cube
 * @returns {CubeItem}
 */
export const structCubeBuilder = cube => {
  const uri = cube.toString();
  const cbAnn = cube.annotations || {};

  const splitOrEmpty = content => (content ? content.split(",") : []);

  /** @type {CubeItem} */
  const cubeItem = {
    caption: cube.caption,
    crosswalkDimensions: splitOrEmpty(cbAnn.crosswalk_only_dimensions),
    datasetHref: cbAnn.dataset_link || "",
    datasetName: cbAnn.dataset_name || "",
    dimensions: [],
    dimNames: [],
    hideInMap: yn(cbAnn.hide_in_map) || false,
    hideInUi: yn(cbAnn.hide_in_ui) || false,
    key: unique(uri),
    measures: [],
    name: cube.name,
    server: cube.server,
    sourceDescription: cbAnn.source_description || "",
    sourceHref: cbAnn.source_link || "",
    sourceName: cbAnn.source_name || "",
    subtopic: cbAnn.subtopic || "Other",
    tableId: cbAnn.table_id || "",
    topic: cbAnn.topic || "Other",
    uri
  };

  // Dimensions must be reduced before measures
  cube.dimensions.reduce(structDimensionReducer, cubeItem);
  cube.measures.reduce(structMeasureReducer, cubeItem);

  return cubeItem;
};

/**
 * Creates the base structured object for a vizbuilder dimension
 * @param {CubeItem} cubeItem
 * @param {import("@datawheel/olap-client").Dimension} dimension
 * @returns {CubeItem}
 */
export const structDimensionReducer = (cubeItem, dimension) => {
  const uri = dimension.toString();
  const dmAnn = dimension.annotations || {};

  const dimensionType = dimension.dimensionType;
  const type = dmAnn.dim_type
    ? dmAnn.dim_type
    : dimensionType === DimType.Geographic || /geography|state/i.test(dimension.name)
      ? "GEOGRAPHY"
      : dimensionType === DimType.Time || /date|time/i.test(dimension.name)
        ? "TIME"
        : "GENERIC";

  const defaultHierarchy = dimension.defaultHierarchy;

  /** @type {DimensionItem} */
  const dimensionItem = {
    caption: dimension.caption,
    cube: cubeItem.name,
    defaultHierarchy: defaultHierarchy ? defaultHierarchy.name : undefined,
    defaultYear: Number.parseInt(`${dmAnn.default_year}`) || undefined,
    hideInMap: dmAnn.hide_in_map ? yn(dmAnn.hide_in_map) || false : cubeItem.hideInMap,
    hideInUi: dmAnn.hide_in_ui ? yn(dmAnn.hide_in_ui) || false : cubeItem.hideInUi,
    hierarchies: [],
    isCrosswalk: cubeItem.crosswalkDimensions.includes(dimension.name),
    isRequired: yn(dmAnn.is_required) || false,
    key: unique(uri),
    levelCount: 0,
    name: dimension.name,
    server: cubeItem.server,
    type,
    uri
  };

  dimension.hierarchies.reduce(structHierarchyReducer, dimensionItem);

  cubeItem.dimensions.push(dimensionItem);
  return cubeItem;
};

/**
 * Creates the base structured object for a vizbuilder hierarchy
 * @param {DimensionItem} dimensionItem
 * @param {import("@datawheel/olap-client").Hierarchy} hierarchy
 * @returns {DimensionItem}
 */
export const structHierarchyReducer = (dimensionItem, hierarchy) => {
  const hiAnn = hierarchy.annotations;
  const uri = hierarchy.toString();

  /** @type {HierarchyItem} */
  const hierarchyItem = {
    caption: hierarchy.caption,
    cube: dimensionItem.cube,
    dimension: dimensionItem.name,
    hideInMap: hiAnn.hide_in_map
      ? yn(hiAnn.hide_in_map) || false
      : dimensionItem.hideInMap,
    hideInUi: hiAnn.hide_in_ui ? yn(hiAnn.hide_in_ui) || false : dimensionItem.hideInUi,
    key: unique(uri),
    levels: [],
    name: hierarchy.name,
    server: dimensionItem.server,
    uri
  };

  hierarchy.levels.reduce(structLevelReducer, hierarchyItem);

  dimensionItem.levelCount += hierarchy.levels.length;
  dimensionItem.hierarchies.push(hierarchyItem);
  return dimensionItem;
};

/**
 * Creates the base structured object for a vizbuilder level
 * @param {HierarchyItem} hierarchyItem
 * @param {import("@datawheel/olap-client").Level} level
 * @returns {HierarchyItem}
 */
export const structLevelReducer = (hierarchyItem, level) => {
  const uri = level.toString();
  const lvAnn = level.annotations;

  /** @type {LevelItem} */
  const levelItem = {
    caption: level.caption,
    cube: hierarchyItem.cube,
    dimension: hierarchyItem.dimension,
    hideInMap: lvAnn.hide_in_map
      ? yn(lvAnn.hide_in_map) || false
      : hierarchyItem.hideInMap,
    hideInUi: lvAnn.hide_in_ui ? yn(lvAnn.hide_in_ui) || false : hierarchyItem.hideInUi,
    hierarchy: hierarchyItem.name,
    key: unique(uri),
    name: level.name,
    server: hierarchyItem.server,
    uri
  };

  hierarchyItem.levels.push(levelItem);
  return hierarchyItem;
};

/**
 * Creates a MeasureItem object
 * @param {CubeItem} cubeItem
 * @param {import("@datawheel/olap-client").Measure} measure
 * @returns {CubeItem}
 */
export const structMeasureReducer = (cubeItem, measure) => {
  const uri = measure.toString();
  const caption = measure.caption || measure.name;
  const msAnn = measure.annotations || {};

  const {error_type, error_for_measure} = msAnn;
  const topic = msAnn.topic || cubeItem.topic;
  const subtopic = msAnn.subtopic || cubeItem.subtopic;

  const dimNames =
    cubeItem.dimNames.length > 0
      ? cubeItem.dimNames
      : cubeItem.dimensions
          .sort((a, b) => {
            const diff = b.levelCount - a.levelCount;
            return diff !== 0 ? diff : a.name.localeCompare(b.name);
          })
          .map(dim => dim.name);
  cubeItem.dimNames = dimNames;

  const category = [topic, subtopic];
  const searchIndex = category
    .concat(caption, cubeItem.sourceName, cubeItem.datasetName, dimNames)
    .join("|");
  const sortKey = category.concat(caption).join("|");

  /** @type {MeasureItem} */
  const measureItem = {
    aggregationType:
      msAnn.pre_aggregation_method ||
      msAnn.aggregation_method ||
      measure.aggregatorType ||
      "UNKNOWN",
    caption,
    cube: cubeItem.uri,
    datasetHref: cubeItem.datasetHref,
    datasetName: cubeItem.datasetName,
    defaultGroup: msAnn.ui_default_drilldown,
    details: msAnn.details || "",
    dimNames,
    hideInMap: msAnn.hide_in_map ? yn(msAnn.hide_in_map) || false : cubeItem.hideInMap,
    hideInUi: msAnn.hide_in_ui ? yn(msAnn.hide_in_ui) || false : cubeItem.hideInUi,
    isCollectionFor: msAnn.collection_for_measure,
    isLCIFor: error_type === "LCI" ? error_for_measure : undefined,
    isMOEFor:
      error_type === "LCI" || error_type === "UCI" ? undefined : error_for_measure,
    isSourceFor: msAnn.source_for_measure,
    isUCIFor: error_type === "UCI" ? error_for_measure : undefined,
    key: unique(uri),
    name: measure.name,
    searchIndex,
    server: cubeItem.server,
    sortKey,
    sourceHref: cubeItem.sourceHref,
    sourceName: cubeItem.sourceName,
    subtopic,
    tableId: cubeItem.tableId ? `${cubeItem.tableId}|${measure.name}` : undefined,
    topic,
    unit: msAnn.units_of_measurement || "",
    uri
  };

  cubeItem.measures.push(measureItem);
  return cubeItem;
};

/**
 * Creates a GroupItem object
 * @param {any} params
 * @returns {GroupItem}
 */
export const structGroup = params => {
  return {
    dimension: params.dimension,
    hierarchy: params.hierarchy,
    level: params.level || params.name,
    key: params.key || Math.random().toString(16).slice(2),
    members: ensureArray(params.members)
  };
};

/**
 * Creates a FilterItem object
 * @param {any} params
 * @returns {FilterItem}
 */
export const structFilter = params => {
  return {
    inputtedValue: `${params.inputtedValue || params.value || 0}`,
    interpretedValue: params.interpretedValue || params.value || 0,
    key: params.key || Math.random().toString(16).slice(2),
    measure: params.measure || params.name,
    operator: params.operator || Comparison.EQ
  };
};
