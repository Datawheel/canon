const sharedMethods = [];

const commonKeys = ["groupBy", "x", "y", "value", "colorScale", "label", "subtitle", "sum"];
const commonMethods = {};
commonKeys.forEach(key => {
  commonMethods[key] = {
    key: [key],
    format: "Accessor",
    required: true
  };
});
commonMethods.groupBy.typeof = "id";
const {groupBy, x, y, value, colorScale, label, subtitle, sum} = commonMethods;

module.exports = [
  {
    name: "Area Plot", // the name to be displayed in UI mode
    type: "AreaPlot", // the actual d3plus component (the "type" key)
    methods: [groupBy, x, y, ...sharedMethods]
  },
  {
    name: "Bar Chart", 
    type: "BarChart", 
    methods: [groupBy, x, y, ...sharedMethods]
  },
  {
    name: "Bump Chart", 
    type: "BumpChart", 
    methods: [groupBy, x, y, ...sharedMethods]
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
        format: "Input",
        required: true
      }
    ]
  },
  {
    name: "Graphic", 
    type: "Graphic", 
    methods: [label, value, subtitle, ...sharedMethods, 
      {
        key: "imageURL",
        format: "Input",
        required: true
      }
    ]
  },
  {
    name: "Line Plot", 
    type: "LinePlot", 
    methods: [groupBy, x, y, ...sharedMethods]
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
    name: "Stacked Area", 
    type: "StackedArea", 
    methods: [groupBy, x, y, ...sharedMethods]
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
        key: "imageURL",
        format: "Checkbox",
        required: true
      }
    ]
  }
];
