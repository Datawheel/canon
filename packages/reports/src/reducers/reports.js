const {normalize, schema} = require("normalizr");

const reportSchema = [new schema.Entity("reports", {
  meta: [new schema.Entity("meta")],
  sections: [new schema.Entity("sections", {
    blocks: [new schema.Entity("blocks", {
      inputs: [new schema.Entity("inputs")],
      consumers: [new schema.Entity("consumers")]
    })]
  })]
})];

export default (reports = {}, action) => {
  switch (action.type) {
    case "REPORTS_GET":
      const structure = normalize(action.data, reportSchema);
      console.log("Redux Structure:", structure);
      return structure;
    case "REPORT_NEW":
      return normalize(action.data, reportSchema);
    case "REPORT_DELETE":
      return normalize(action.data, reportSchema);
    case "REPORT_UPDATE":
      return normalize(action.data, reportSchema);
    case "REPORT_TRANSLATE":
      return reports.map(p => p.id === action.data.id ? Object.assign({}, p, {...action.data}) : p);
    case "BLOCK_NEW":
      return normalize(action.data, reportSchema);
    // todo1.0 add sorting here, like sections
    case "BLOCK_UPDATE":
      return normalize(action.data, reportSchema);
    case "BLOCK_DELETE":
      return normalize(action.data, reportSchema);
    // Dimensions
    case "DIMENSION_MODIFY":
      return reports;

    // Sections
    case "SECTION_NEW":
      return normalize(action.data, reportSchema);
    case "SECTION_UPDATE":
      return normalize(action.data, reportSchema);
    case "SECTION_TRANSLATE":
      return reports.map(p => Object.assign({}, p, {sections: p.sections.map(s => s.id === action.data.id ? Object.assign({}, s, {...action.data}) : s)}));
    case "SECTION_DELETE":
      return normalize(action.data.reports, reportSchema);
    case "SECTION_ACTIVATE":
      return normalize(action.data, reportSchema);

      // Block inputs
    case "BLOCK_INPUT_NEW":
      return normalize(action.data, reportSchema);
    case "BLOCK_INPUT_DELETE":
      return normalize(action.data, reportSchema);

    default: return reports;
  }
};
