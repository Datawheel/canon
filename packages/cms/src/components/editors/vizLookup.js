// Create a lookup for some commonly used keys
const commonKeys = ["groupBy", "x", "y", "value", "colorScale", "label", "subtitle", "sum"];
const commonMethods = {};
commonKeys.forEach(key => {
  commonMethods[key] = {
    key,
    display: key,
    format: "Accessor",
    required: true
  };
});
// Override some of the labels and types
commonMethods.groupBy.typeof = "id";
commonMethods.groupBy.display = "Grouping";
commonMethods.colorScale.display = "Color Scale";
commonMethods.value.typeof = "number";
commonMethods.sum.typeof = "number";

// Create a lookup for some optional keys. Nested properties are handled by dots, e.g. yConfig.title
const optionalKeys = ["xConfig", "yConfig"];
optionalKeys.forEach(key => {
  commonMethods[key] = {
    key: `${key}.title`,
    display: `${key.charAt(0).toUpperCase()} Axis Label`,
    format: "Input",
    required: false
  };
});

// Promote certain keys to appear in the tooltip by default
const tooltipKeys = ["x", "y", "value", "sum"];
tooltipKeys.forEach(key => {
  commonMethods[key].tooltip = true;
});
const {groupBy, x, y, value, colorScale, label, subtitle, sum, xConfig, yConfig} = commonMethods;

module.exports = [
  {
    name: "Area Plot", // the name to be displayed in UI mode
    type: "AreaPlot", // the actual d3plus component (the "type" key)
    methods: [groupBy, x, y, xConfig, yConfig]
  },
  {
    name: "Bar Chart", 
    type: "BarChart", 
    methods: [groupBy, x, y, xConfig, yConfig]
  },
  {
    name: "Bump Chart", 
    type: "BumpChart", 
    methods: [groupBy, x, y, xConfig, yConfig]
  },
  {
    name: "Donut", 
    type: "Donut", 
    methods: [groupBy, value]
  },
  {
    name: "Geo Map", 
    type: "Geomap", 
    methods: [groupBy, colorScale, 
      {
        key: "topojson",
        display: "topojson",
        format: "Input",
        required: true
      }
    ]
  },
  {
    name: "Graphic", 
    type: "Graphic", 
    methods: [
      Object.assign({}, label, {required: false}),
      Object.assign({}, value, {required: false}),
      Object.assign({}, subtitle, {required: false}),
      {
        key: "imageURL",
        display: "Image URL",
        format: "Input",
        required: true
      }
    ]
  },
  {
    name: "Line Plot", 
    type: "LinePlot", 
    methods: [groupBy, x, y, xConfig, yConfig]
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
    methods: [x, y, xConfig, yConfig,
      {
        key: "size",
        display: "Size",
        format: "Accessor",
        required: false
      }
    ]
  },
  {
    name: "Stacked Area", 
    type: "StackedArea", 
    methods: [groupBy, x, y, xConfig, yConfig]
  },
  {
    name: "Treemap", 
    type: "Treemap", 
    methods: [groupBy, sum]
  },
  {
    name: "Table", 
    type: "Table", 
    methods: [
      {
        key: "columns",
        display: "Columns",
        format: "Checkbox",
        required: true
      }
    ]
  }
];
