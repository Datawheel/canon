export const src = ["https://api.datamexico.org/tesseract/"];

export const defaultMeasure =
  "https://api.datamexico.org/tesseract/cubes/inegi_envipe/measures/Homes";

export const defaultGroup = [
  "Geography Municipality.Geography.State",
  "Geography.State",
  "Gender.Gender",
  "Age.Age"
];

export const visualizations = [
  "geomap",
  "treemap",
  "barchart",
  "lineplot",
  "histogram",
  "stacked"
];

export const topojson = {
  "Metro Area": {
    ocean: "transparent",
    topojson: "/topojson/mex/MetroAreas.json",
    topojsonId: d => d.properties.zm_id
  },
  State: {
    ocean: "transparent",
    topojson: "/topojson/mex/Entities.json",
    topojsonId: d => d.properties.ent_id
  },
  Country: {
    topojson: "/topojson/mex/Country.json",
    fitFilter: (d) => ["ATA"].indexOf(d.id) < 0,
    topojsonId: d => d.id.toLowerCase(),
  }
};

export const config = {
  colorScaleConfig: {color: ["#b0cde1", "#90bad8", "#4c96cb", "#3182bd", "#004374"]},
  colorScalePosition: "bottom",
  detectResizeDelay: 100,
  zoomScroll: true
};
