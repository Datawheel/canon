const sharedMethods = [];

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
commonMethods.groupBy.typeof = "id";
commonMethods.groupBy.display = "Grouping";
commonMethods.colorScale.display = "Color Scale";
commonMethods.value.typeof = "number";
commonMethods.sum.typeof = "number";

const optionalKeys = ["xConfig", "yConfig"];
optionalKeys.forEach(key => {
  commonMethods[key] = {
    key: `${key}.title`,
    display: `${key.charAt(0).toUpperCase()} Axis Label`,
    format: "Input",
    required: false
  };
});

const tooltipKeys = ["x", "y", "value", "sum"];
tooltipKeys.forEach(key => {
  commonMethods[key].tooltip = true;
});
const {groupBy, x, y, value, colorScale, label, subtitle, sum, xConfig, yConfig} = commonMethods;

module.exports = [
  {
    name: "Area Plot", // the name to be displayed in UI mode
    type: "AreaPlot", // the actual d3plus component (the "type" key)
    methods: [groupBy, x, y, xConfig, yConfig, ...sharedMethods]
  },
  {
    name: "Bar Chart", 
    type: "BarChart", 
    methods: [groupBy, x, y, xConfig, yConfig, ...sharedMethods]
  },
  {
    name: "Bump Chart", 
    type: "BumpChart", 
    methods: [groupBy, x, y, xConfig, yConfig, ...sharedMethods]
  },
  {
    name: "Donut", 
    type: "Donut", 
    methods: [groupBy, value, ...sharedMethods]
  },
  {
    name: "Geo Map", 
    type: "Geomap", 
    methods: [groupBy, colorScale, ...sharedMethods, 
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
      ...sharedMethods, 
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
    methods: [groupBy, x, y, xConfig, yConfig, ...sharedMethods]
  },
  {
    name: "Percentage Bar", 
    type: "PercentageBar", 
    methods: [groupBy, sum, ...sharedMethods]
  },
  {
    name: "Pie Chart", 
    type: "Pie", 
    methods: [groupBy, value, ...sharedMethods]
  },
  {
    name: "Scatter/Bubble", 
    type: "Plot", 
    methods: [x, y, xConfig, yConfig, ...sharedMethods,
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
    methods: [groupBy, x, y, xConfig, yConfig, ...sharedMethods]
  },
  {
    name: "Treemap", 
    type: "Treemap", 
    methods: [groupBy, sum, ...sharedMethods]
  },
  {
    name: "Table", 
    type: "Table", 
    methods: [...sharedMethods, 
      {
        key: "columns",
        display: "Columns",
        format: "Checkbox",
        required: true
      }
    ]
  }
];
