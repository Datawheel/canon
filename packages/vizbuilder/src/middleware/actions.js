export const CORE_INITIALIZE = "vizbuilder/CORE/INITIALIZE";
export const CORE_INITIALIZE_MEASURE = "vizbuilder/CORE/INITIALIZE/MEASURE";
export const CORE_INITIALIZE_PARAMS = "vizbuilder/CORE/INITIALIZE/PARAMS";
export const CORE_UPDATE_CHART = "vizbuilder/CORE/UPDATE_CHART";
export const CORE_UPDATE_CONFINT = "vizbuilder/CORE/UPDATE_CONFINT";
export const CORE_UPDATE_DATASET = "vizbuilder/CORE/UPDATE_DATASET";
export const CORE_UPDATE_FILTER = "vizbuilder/CORE/UPDATE_FILTER";
export const CORE_UPDATE_GROUP = "vizbuilder/CORE/UPDATE_GROUP";
export const CORE_UPDATE_MEASURE = "vizbuilder/CORE/UPDATE_MEASURE";
export const CORE_UPDATE_PERIOD = "vizbuilder/CORE/UPDATE_PERIOD";
export const CORE_UPDATE_PERMALINK = "vizbuilder/CORE/UPDATE_PERMALINK";
export const CORE_VALIDATE_MEASURE = "vizbuilder/CORE/VALIDATE_MEASURE";
export const CORE_VALIDATE_PARAMS = "vizbuilder/CORE/VALIDATE_PARAMS";
export const OLAP_FETCHCUBES = "vizbuilder/OLAP/CUBES";
export const OLAP_FETCHMEMBERS = "vizbuilder/OLAP/MEMBERS";
export const OLAP_RUNQUERY = "vizbuilder/OLAP/RUNQUERY";
export const OLAP_SETUP = "vizbuilder/OLAP/SETUP";

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
export const doUpdatePermalink = () => ({type: CORE_UPDATE_PERMALINK});

/** */
export const doValidateParams = () => ({type: CORE_VALIDATE_PARAMS});


/**
 * Adds the list of urls to the current client instance.
 * @param {string|string[]} urlList
 */
export const doClientSetup = urlList => ({type: OLAP_SETUP, payload: urlList});

/**
 * Retrieves the full list of cubes for the current client instance.
 */
export const doFetchCubes = () => ({type: OLAP_FETCHCUBES});

/**
 * Retrieves the full list of members associated to the level item.
 * @param {LevelLike} level
 */
export const doFetchMembers = level => ({type: OLAP_FETCHMEMBERS, payload: level});

/**
 * Executes the query with the parameters currently set by the user.
*/
export const doRunQuery = () => ({type: OLAP_RUNQUERY});
