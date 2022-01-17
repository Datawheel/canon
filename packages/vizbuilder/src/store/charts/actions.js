export const CHARTS_UPDATE = "vizbuilder/CHARTS/UPDATE";

/** @param {Chart[]} charts */
export const doChartsUpdate = charts => ({type: CHARTS_UPDATE, payload: charts});
