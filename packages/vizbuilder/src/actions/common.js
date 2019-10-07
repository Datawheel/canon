export const CHARTS_UPDATE = "vizbuilder/CHARTS/UPDATE";
export const CUBES_UPDATE = "vizbuilder/CUBES/UPDATE";
export const INSTANCE_UPDATE = "vizbuilder/INSTANCE/UPDATE";

export const doCubesUpdate = cubes => ({type: CUBES_UPDATE, payload: cubes});
export const doChartsUpdate = charts => ({type: CHARTS_UPDATE, payload: charts});
export const doInstanceUpdate = instance => ({type: INSTANCE_UPDATE, payload: instance});
