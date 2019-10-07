export const colorScaleConfig = {
  color: ["#cfdfeb", "#b0cde1", "#90bad8", "#6ea7d2", "#4c96cb", "#3182bd", "#004374"]
};

export const ENDPOINT_DEFAULT = "https://halite-api.datausa.io/";

export const VISUALIZE_MEASURE_DEFAULT = "Total Population";

export const VISUALIZE_GROUPS_DEFAULT = [
  "Geography.State",
  "Origin State.Origin State",
  "Gender.Gender",
  "Age.Age"
];

export const VISUALIZE_CONFIG_DEFAULT = {
  colorScaleConfig,
  colorScalePosition: "bottom",
  detectResizeDelay: 100,
  shapeConfig: {
    hoverOpacity: 1
  },
  zoomScroll: true
};

export const TOPOJSON_DEFAULT = {
  Nation: {
    topojson: "/topojson/world.json",
    topojsonId: "id",
    topojsonKey: "countries"
  },
  State: {
    topojson: "/topojson/states.json",
    topojsonId: "id",
    topojsonKey: "states"
  },
  get "Origin State"() {
    return this.State;
  },
  get "Destination State"() {
    return this.State;
  },
  County: {
    topojson: "/topojson/counties.json",
    topojsonId: "id",
    topojsonKey: "counties"
  },
  Puma: {
    topojson: "/topojson/pumas.json",
    topojsonId: "id",
    topojsonKey: "pumas"
  },
  get PUMA() {
    return this.Puma;
  },
  Msa: {
    topojson: "/topojson/msas.json",
    topojsonId: "id",
    topojsonKey: "msas"
  },
  get MSA() {
    return this.Msa;
  }
};

export const CONFIG_DEFAULT = {
  totalConfig: {
    fontSize: 10,
    padding: 5,
    resize: false,
    textAnchor: "middle"
  },
  confidenceConfig: {
    fillOpacity: 0.15
  },
  ocean: "transparent",
  projection: "geoAlbersUsa",
  tiles: false,
  zoom: true,
  zoomFactor: 2
};

export const PERMALINK_KEYWORDS_DEFAULT = {
  measure: "msr",
  groups: "grp",
  filters: "fil",
  enlarged: "show"
};
