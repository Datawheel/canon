const {
  colorScale,
  columns,
  groupBy,
  imageURL,
  label,
  size,
  subtitle,
  sum,
  topojson,
  value,
  x,
  xConfigTitle,
  y,
  yConfigTitle
} = require("./vizMethods.js");

module.exports = [
  {
    name: "Bar Chart", 
    type: "BarChart", 
    methods: [groupBy, x, y, xConfigTitle, yConfigTitle]
  },
  {
    name: "Bump Chart", 
    type: "BumpChart", 
    methods: [groupBy, x, y, xConfigTitle, yConfigTitle]
  },
  {
    name: "Donut", 
    type: "Donut", 
    methods: [groupBy, value]
  },
  {
    name: "Geo Map", 
    type: "Geomap", 
    methods: [groupBy, colorScale, topojson]
  },
  {
    name: "Graphic", 
    type: "Graphic", 
    methods: [
      Object.assign({}, label, {required: false}),
      Object.assign({}, value, {required: false}),
      Object.assign({}, subtitle, {required: false}),
      imageURL
    ]
  },
  {
    name: "Line Plot", 
    type: "LinePlot", 
    methods: [groupBy, x, y, xConfigTitle, yConfigTitle]
  },
  {
    name: "Percentage Bar", 
    type: "PercentageBar", 
    methods: [groupBy, value]
  },
  {
    name: "Pie Chart", 
    type: "Pie", 
    methods: [groupBy, value]
  },
  {
    name: "Scatter/Bubble", 
    type: "Plot", 
    methods: [x, y, xConfigTitle, yConfigTitle, size]
  },
  {
    name: "Stacked Area", 
    type: "StackedArea", 
    methods: [groupBy, x, y, xConfigTitle, yConfigTitle]
  },
  {
    name: "Treemap", 
    type: "Treemap", 
    default: true,
    methods: [groupBy, sum]
  },
  {
    name: "Table", 
    type: "Table", 
    methods: [columns]
  }
];
