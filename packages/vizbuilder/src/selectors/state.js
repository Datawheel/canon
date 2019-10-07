/**
 * @param {{vizbuilder: VizbuilderState}} state
 * @returns {Chart[]}
 */
export const selectChartsState = state => state.vizbuilder.charts;

/**
 * @param {{vizbuilder: VizbuilderState}} state
 * @returns {CubeItem[]}
 */
export const selectCubesState = state => state.vizbuilder.cubes;

/**
 * @param {{vizbuilder: VizbuilderState}} state
 * @returns {InstanceState}
 */
export const selectInstanceParams = state => state.vizbuilder.instance;

/**
 * @param {{vizbuilder: VizbuilderState}} state
 * @returns {LoadingState}
 */
export const selectLoadState = state => state.vizbuilder.loading;

/**
 * @param {{vizbuilder: VizbuilderState}} state
 * @returns {QueryState}
 */
export const selectQueryState = state => state.vizbuilder.query;
