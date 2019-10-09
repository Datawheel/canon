export const QUERY_CHART_UPDATE = "vizbuilder/QUERY/CHART/UPDATE";
export const QUERY_CONFINT_TOGGLE = "vizbuilder/QUERY/CONFINT/TOGGLE";
export const QUERY_FILTERS_CREATE = "vizbuilder/QUERY/FILTERS/CREATE";
export const QUERY_FILTERS_DELETE = "vizbuilder/QUERY/FILTERS/DELETE";
export const QUERY_FILTERS_UPDATE = "vizbuilder/QUERY/FILTERS/UPDATE";
export const QUERY_GROUPS_CREATE = "vizbuilder/QUERY/GROUPS/CREATE";
export const QUERY_GROUPS_DELETE = "vizbuilder/QUERY/GROUPS/DELETE";
export const QUERY_GROUPS_UPDATE = "vizbuilder/QUERY/GROUPS/UPDATE";
export const QUERY_INYECT = "vizbuilder/QUERY/INYECT";
export const QUERY_MEASURE_UPDATE = "vizbuilder/QUERY/MEASURE/UPDATE";
export const QUERY_PERIOD_UPDATE = "vizbuilder/QUERY/PERIOD/UPDATE";

/** @param {string?} chart */
export const doChartUpdate = chart => ({type: QUERY_CHART_UPDATE, payload: chart});

/** @param {boolean} [value] */
export const doConfIntToggle = value => ({type: QUERY_CONFINT_TOGGLE, payload: value});

/** @param {FilterItem} filter */
export const doFilterCreate = filter => ({type: QUERY_FILTERS_CREATE, payload: filter});

/** @param {FilterItem} filter */
export const doFilterDelete = filter => ({type: QUERY_FILTERS_DELETE, payload: filter});

/** @param {FilterItem} filter */
export const doFilterUpdate = filter => ({type: QUERY_FILTERS_UPDATE, payload: filter});

/** @param {GroupItem} group */
export const doGroupCreate = group => ({type: QUERY_GROUPS_CREATE, payload: group});

/** @param {GroupItem} group */
export const doGroupDelete = group => ({type: QUERY_GROUPS_DELETE, payload: group});

/** @param {GroupItem} group */
export const doGroupUpdate = group => ({type: QUERY_GROUPS_UPDATE, payload: group});

/** @param {string} msr */
export const doMeasureUpdate = msr => ({type: QUERY_MEASURE_UPDATE, payload: msr});

/** @param {number} period */
export const doPeriodUpdate = period => ({type: QUERY_PERIOD_UPDATE, payload: period});

/** @param {Partial<QueryState>} queryState */
export const doQueryInyect = queryState => ({type: QUERY_INYECT, payload: queryState});
