export const src = ["https://graphite-api.datausa.io/"];

export const defaultMeasure = "Total Population";

export const defaultGroup = ["Geography.State","Origin State.Origin State","Gender.Gender","Age.Age"];

export const visualizations = ["geomap","treemap","barchart","lineplot","histogram","stacked"];

export const topojson = {
  "Birthplace":{"ocean":"#d4dadc","topojson":"/topojson/birthplace-all.json"},
  "County":{"ocean":"transparent","topojson":"/topojson/County.json"},
  "MSA":{"ocean":"transparent","topojson":"/topojson/Msa.json"},
  "PUMA":{"ocean":"transparent","topojson":"/topojson/Puma.json"},
  "State":{"ocean":"transparent","topojson":"/topojson/State.json"},
  "Origin State":{"ocean":"transparent","topojson":"/topojson/State.json"},
  "Destination State":{"ocean":"transparent","topojson":"/topojson/State.json"}
}

export const config = {
  "colorScaleConfig":{"color":["#b0cde1","#90bad8","#4c96cb","#3182bd","#004374"]},
  "colorScalePosition":"bottom",
  "detectResizeDelay":100,
  "zoomScroll":true
}

export const tableLogic = (cubes) => cubes.find(d => d.name.match(/_5/)) || cubes[0];

export const measureConfig = {
  "Population in Poverty by Gender, Age, and Race":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Children In Poverty":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Unemployment":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Uninsured":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Uninsured Adults":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Uninsured Children":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Could Not See Doctor Due To Cost":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Adult Obesity":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Diabetes":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Sexually Transmitted Infections":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Hiv Prevalence":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Alcohol-Impaired Driving Deaths":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Excessive Drinking":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Adult Smoking":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Homicide Rate":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Violent Crime":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Motor Vehicle Crash Deaths":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Premature Death":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Poor Or Fair Health":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Poor Physical Health Days":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Poor Mental Health Days":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Low Birthweight":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Food Environment Index":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Physical Inactivity":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Access To Exercise Opportunities":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Teen Births":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Social Associations":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Injury Deaths":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Air Pollution - Particulate Matter 1":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Drinking Water Violations":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Premature Age-Adjusted Mortality":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Infant Mortality":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Child Mortality":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Food Insecurity":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Limited Access To Healthy Foods":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Children Eligible For Free Or Reduced Price Lunch":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Severe Housing Problems":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Opioid Overdose Death Rate Per 100,000 Age-Adjusted":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Drug Overdose Death Rate Per 100,000 Age-Adjusted":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Drug Overdose Deaths":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Nonmedical Use of Prescription Pain Relievers Among Individuals Aged 12+":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Borrowers In Default":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Borrowers Entered Repayment":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}},
  "Default Rate":{"colorScaleConfig":{"color":["#e4b4b4","#dc9595","#cf5555","#CA3434","#7b0000"]}}
}
