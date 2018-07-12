export const isWindowAvailable = typeof window !== "undefined";

export const STATES = [
  "Hawaii",
  "Alaska",
  "Oregon",
  "Washington",
  "California",
  "Nevada",
  "Idaho",
  "Arizona",
  "Montana",
  "Utah",
  "New Mexico",
  "Colorado",
  "Wyoming",
  "North Dakota",
  "South Dakota",
  "Texas",
  "Oklahoma",
  "Nebraska",
  "Kansas",
  "Iowa",
  "Minnesota",
  "Arkansas",
  "Missouri",
  "Louisiana",
  "Mississippi",
  "Illinois",
  "Wisconsin",
  "Tennessee",
  "Alabama",
  "Indiana",
  "Kentucky",
  "Michigan",
  "Georgia",
  "Florida",
  "Ohio",
  "West Virginia",
  "South Carolina",
  "North Carolina",
  "Virginia",
  "District of Columbia",
  "Pennsylvania",
  "Maryland",
  "Delaware",
  "New Jersey",
  "New York",
  "Connecticut",
  "Vermont",
  "New Hampshire",
  "Rhode Island",
  "Massachusetts",
  "Maine",
  "Puerto Rico"
];

export function getAreaChartDimensions() {
  if (isWindowAvailable) {
    const areaChart = document.querySelector(
      ".vizbuilder .area-chart > .wrapper"
    );
    const dimensions = areaChart.getBoundingClientRect();
    return {width: dimensions.width - 80, height: dimensions.height - 180};
  }
  else {
    return {width: 900, height: 480};
  }
}
