export const CUBES_UPDATE = "vizbuilder/CUBES/UPDATE";

/** @param {CubeItem[]} cubes */
export const doCubesUpdate = cubes => ({type: CUBES_UPDATE, payload: cubes});
