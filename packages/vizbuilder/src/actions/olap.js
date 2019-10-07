export const OLAP_FETCHCUBES = "vizbuilder/OLAP/CUBES";
export const OLAP_FETCHMEMBERS = "vizbuilder/OLAP/MEMBERS";
export const OLAP_RUNQUERY = "vizbuilder/OLAP/RUNQUERY";
export const OLAP_SETUP = "vizbuilder/OLAP/SETUP";

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
 * Retrieves the full list of members associated to the levelRef.
 * @param {LevelItem} level
 */
export const doFetchMembers = level => ({type: OLAP_FETCHMEMBERS, payload: level});

/**
 * Executes the query with the parameters currently set by the user.
*/
export const doRunQuery = () => ({type: OLAP_RUNQUERY});
