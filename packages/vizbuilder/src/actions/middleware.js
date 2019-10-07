export const CORE_INITIALIZE = "vizbuilder/CORE/INITIALIZE";
export const CORE_INITIALIZE_MEASURE = "vizbuilder/CORE/INITIALIZE/MEASURE";
export const CORE_UPDATE_PERMALINK = "vizbuilder/CORE/UPDATE_PERMALINK";
export const CORE_UPDATE_CHART = "vizbuilder/CORE/UPDATE_CHART";
export const CORE_UPDATE_CONFINT = "vizbuilder/CORE/UPDATE_CONFINT";
export const CORE_UPDATE_DATASET = "vizbuilder/CORE/UPDATE_DATASET";
export const CORE_UPDATE_FILTER = "vizbuilder/CORE/UPDATE_FILTER";
export const CORE_UPDATE_GROUP = "vizbuilder/CORE/UPDATE_GROUP";
export const CORE_UPDATE_MEASURE = "vizbuilder/CORE/UPDATE_MEASURE";
export const CORE_UPDATE_PERIOD = "vizbuilder/CORE/UPDATE_PERIOD";
export const CORE_VALIDATE_QUERY = "vizbuilder/CORE/VALIDATE_QUERY";
export const CORE_VALIDATE_MEASURE = "vizbuilder/CORE/VALIDATE_MEASURE";

/**
 * @param {import("..").VizbuilderProps} props
 */
export const doSetup = props => ({type: CORE_INITIALIZE, payload: props});

/**
 * @param {(cubes: CubeItem[]) => CubeItem} [defaultTable]
 */
export const doInitializeMeasure = defaultTable => ({
  type: CORE_INITIALIZE_MEASURE,
  payload: {defaultTable}
});

/**
 * @param {object} params
 * @param {MeasureItem} [params.measure]
 * @param {((cubes: CubeItem[]) => CubeItem) | undefined} [params.defaultTable]
 */
export const doUpdateMeasure = params => ({type: CORE_UPDATE_MEASURE, payload: params});

/**
 * @param {string} cubeName
 */
export const doUpdateDataset = cubeName => ({
  type: CORE_UPDATE_DATASET,
  payload: cubeName
});

/**
 * @param {GroupItem} groupItem
 */
export const doUpdateGroup = groupItem => ({type: CORE_UPDATE_GROUP, payload: groupItem});

/** */
export const doPermalinkUpdate = () => ({type: CORE_UPDATE_PERMALINK});
