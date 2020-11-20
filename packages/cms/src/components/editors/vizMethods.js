module.exports = {
  colorScale: {
    key: "colorScale",
    display: "Color scale",
    format: "Accessor",
    required: true
  },
  column: {
    key: "column",
    display: "Columns",
    format: "Accessor",
    required: true
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
    required: true
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
    tooltip: true
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
    tooltip: true
  },
  yConfigTitle: {
    key: "yConfig.title",
    display: "Y-axis label",
    format: "Input",
    required: false
  }
};
