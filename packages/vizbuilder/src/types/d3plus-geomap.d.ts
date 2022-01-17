declare module "d3plus-geomap" {
  export interface GeomapConfig {
    fitFilter;
    fitKey;
    fitObject;
    ocean;
    point;
    pointSize;
    pointSizeMax;
    pointSizeMin;
    projection;
    projectionPadding;
    tiles;
    tileUrl;

    /**
   * URL to the topojson file to use in the level.
   */
    topojson: string;

    /**
   * Default color for the map.
   */
    topojsonFill: string | ((datum: any) => string);

    /**
   * If the topojson being used contains boundaries that should not be shown,
   * this method can be used to filter them out of the final output.
   * The value passed can be a single id to remove, an array of ids, or a filter function.
   */
    topojsonFilter: string | string[] | ((datum: any) => string);

    /**
   * If the topojson contains multiple geographical sets (for example, a file containing state and county boundaries), use this method to identify which set to use.
   * If not specified, the first key in the Array returned from using Object.keys on the topojson will be used.
   */
    topojsonKey: string | ((datum: any) => string);

    /**
   * The accessor used to map each topojson geometry to it’s corresponding data point.
   */
    topojsonId: string | ((datum: any) => string);
  }
}
