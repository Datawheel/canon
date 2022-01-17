module.exports = {
  colorScale: {
    key: "colorScale",
    display: "Color Scale",
    format: "Accessor",
    required: false,
    typeof: "number",
    tooltip: true,
    formatter: "colorScaleConfig.axisConfig.tickFormat",
    title: ["colorScaleConfig.axisConfig.title", "colorScaleConfig.legendConfig.title"]
  },
  column: {
    key: "column",
    display: "Columns",
    format: "Accessor",
    required: true,
    formatter: "columnConfig.tickFormat",
    title: "columnConfig.title"
  },
  columnConfigTitle: {
    key: "columnConfig.title",
    display: "Column Title",
    format: "Input",
    required: false
  },
  columns: {
    key: "columns",
    display: "Columns",
    format: "Checkbox",
    required: true
  },
  groupBy: {
    key: "groupBy",
    display: "Grouping",
    format: "Accessor",
    multiple: true,
    required: true,
    typeof: "id"
  },
  label: {
    key: "label",
    display: "Label",
    format: "Accessor",
    required: true
  },
  html: {
    key: "html",
    display: "HTML",
    format: "Variable",
    required: true
  },
  imageURL: {
    key: "imageURL",
    display: "Image URL",
    format: "Input",
    required: true
  },
  row: {
    key: "row",
    display: "Rows",
    format: "Accessor",
    required: true,
    formatter: "rowConfig.tickFormat",
    title: "rowConfig.title"
  },
  rowConfigTitle: {
    key: "rowConfig.title",
    display: "Row Title",
    format: "Input",
    required: false
  },
  size: {
    key: "size",
    display: "Size",
    format: "Accessor",
    required: false
  },
  subtitle: {
    key: "subtitle",
    display: "Subtitle",
    format: "Accessor",
    required: true
  },
  sum: {
    key: "sum",
    display: "Sum",
    format: "Accessor",
    required: true,
    typeof: "number",
    tooltip: true
  },
  topojson: {
    key: "topojson",
    display: "TopoJSON URL",
    format: "Input",
    required: true
  },
  value: {
    key: "value",
    display: "Value",
    format: "Accessor",
    required: true,
    typeof: "number",
    tooltip: true
  },
  x: {
    key: "x",
    display: "X-axis",
    format: "Accessor",
    required: true,
    tooltip: true,
    formatter: "xConfig.tickFormat",
    title: "xConfig.title"
  },
  xConfigTitle: {
    key: "xConfig.title",
    display: "X-axis label",
    format: "Input",
    required: false
  },
  y: {
    key: "y",
    display: "Y-axis",
    format: "Accessor",
    required: true,
    tooltip: true,
    formatter: "yConfig.tickFormat",
    title: "yConfig.title"
  },
  yConfigTitle: {
    key: "yConfig.title",
    display: "Y-axis label",
    format: "Input",
    required: false
  }
};
