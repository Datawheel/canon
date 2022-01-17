const {
  colorScale,
  column,
  columnConfigTitle,
  columns,
  groupBy,
  html,
  imageURL,
  label,
  row,
  rowConfigTitle,
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
    methods: [groupBy, Object.assign({}, colorScale, {required: true}), topojson]
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
    name: "HTML",
    type: "HTML",
    methods: [html]
  },
  {
    name: "Line Plot",
    type: "LinePlot",
    methods: [groupBy, x, y, xConfigTitle, yConfigTitle]
  },
  {
    name: "Matrix",
    type: "Matrix",
    methods: [groupBy, row, column, rowConfigTitle, columnConfigTitle, colorScale]
  },
  {
    name: "Pie Chart",
    type: "Pie",
    methods: [groupBy, value]
  },
  {
    name: "Radial Matrix",
    type: "RadialMatrix",
    methods: [groupBy, row, column, colorScale]
  },
  {
    name: "Scatter/Bubble",
    type: "Plot",
    methods: [x, y, size, xConfigTitle, yConfigTitle, colorScale]
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
    methods: [groupBy, sum, colorScale]
  },
  {
    name: "Table",
    type: "Table",
    methods: [columns]
  }
];
