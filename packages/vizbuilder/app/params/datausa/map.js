import geoAlbersUsaPr from "./geoAlbersUsaPr";

export const config = {
  colorScaleConfig: {
    color: ["#cfdfeb", "#b0cde1", "#90bad8", "#6ea7d2", "#4c96cb", "#3182bd", "#004374"]
  },
  colorScalePosition: "bottom",
  fitObject: "/topojson/usa/State.json",
  fitFilter: d =>
    !["02", "15", "43", "60", "66", "69", "72", "78"].includes(d.id.slice(7)),
  shapeConfig: {
    hoverOpacity: 1
  },
  title: false,
  zoomScroll: true
};

export const defaultGroup = [
  "Geography.County",
  "Geography.County.State",
  "Origin State.Origin State"
];

export const defaultMeasure =
  "https://banana-api.datausa.io/cubes/acs_ygpsar_poverty_by_gender_age_race_1/measures/Poverty%20Rate";

export const instanceKey = "map";

export const measureConfig = {
  "Population in Poverty by Gender, Age, and Race": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Children In Poverty": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Unemployment": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Uninsured": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Uninsured Adults": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Uninsured Children": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Could Not See Doctor Due To Cost": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Adult Obesity": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Diabetes": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Sexually Transmitted Infections": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Hiv Prevalence": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Alcohol-Impaired Driving Deaths": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Excessive Drinking": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Adult Smoking": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Homicide Rate": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Violent Crime": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Motor Vehicle Crash Deaths": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Premature Death": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Poor Or Fair Health": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Poor Physical Health Days": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Poor Mental Health Days": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Low Birthweight": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Food Environment Index": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Physical Inactivity": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Access To Exercise Opportunities": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Teen Births": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Social Associations": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Injury Deaths": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Air Pollution - Particulate Matter 1": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Drinking Water Violations": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Premature Age-Adjusted Mortality": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Infant Mortality": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Child Mortality": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Food Insecurity": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Limited Access To Healthy Foods": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Children Eligible For Free Or Reduced Price Lunch": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Severe Housing Problems": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Opioid Overdose Death Rate Per 100,000 Age-Adjusted": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Drug Overdose Death Rate Per 100,000 Age-Adjusted": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Drug Overdose Deaths": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Nonmedical Use of Prescription Pain Relievers Among Individuals Aged 12+": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Borrowers In Default": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Borrowers Entered Repayment": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  },
  "Default Rate": {
    colorScaleConfig: {color: ["#e4b4b4", "#dc9595", "#cf5555", "#CA3434", "#7b0000"]}
  }
};

export const src = ["https://banana-api.datausa.io/"];

export const tableLogic = cubes => {
  const cube = cubes.find(d => d.name.match(/_5/));
  return cube || cubes[0];
};

export const topojson = {
  "County": {topojson: "/topojson/usa/County.json"},
  "Destination State": {topojson: "/topojson/usa/State.json"},
  "MSA": {topojson: "/topojson/usa/Msa.json", topojsonFilter: d => d.id.indexOf("040") < 0},
  "Origin State": {topojson: "/topojson/usa/State.json"},
  "PUMA": {topojson: "/topojson/usa/Puma.json"},
  "State": {topojson: "/topojson/usa/State.json"}
};

export const visualizations = ["geomap"];
