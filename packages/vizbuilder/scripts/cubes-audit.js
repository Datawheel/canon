// node scripts/cubes-audit.js

const {Client} = require("mondrian-rest-client"),
      fs = require("fs");

const DEFAULT = "https://canon-api.datausa.io";
const client = new Client(process.env.CANON_AUDIT_API || DEFAULT);
const now = new Date()
  .toLocaleString("en-US", {timeZone: "America/New_York"})
  .replace("T", " ")
  .replace(/\..*$/, "");

client.cubes().then(cubes => {
  let row = "## CUBES AUDIT \n";
  row += "\n";
  row += `Data obtained from ${process.env.CANON_AUDIT_API || DEFAULT} \n`;
  row += "\n";
  row += `Last updated on ${now} \n`;
  row += "\n";

  const listCubes = process.env.CANON_AUDIT_CUBE
    ? [cubes.find(cube => cube.name === process.env.CANON_AUDIT_CUBE)] : cubes;

  listCubes.sort((a, b) => a.name > b.name ? 1 : -1).forEach(cube => {
    const {dimensions, measures, annotations} = cube;

    row += `### CUBE: ${cube.name} \n`;

    if (Object.keys(annotations).length < 8) {

      if (!annotations.source_name) row += "- [ ] source_name \n";
      if (!annotations.source_description) row += "- [ ] source_description \n";
      if (!annotations.source_link) row += "- [ ] source_link \n";
      if (!annotations.dataset_name) row += "- [ ] dataset_name \n";
      if (!annotations.dataset_link) row += "- [ ] dataset_link \n";
      if (!annotations.topic) row += "- [ ] topic \n";
      if (!annotations.subtopic) row += "- [ ] subtopic \n";
      if (!annotations.details) row += "- [ ] details \n";
      row += "\n";

    }
    else {
      row += "Happy Hacking. All annotations in the cube have been added! \n";
      row += "\n";
    }

    dimensions.forEach(dimension => {
      if (!dimension.annotations.dim_type) {
        row += `### DIMENSION: ${dimension.name} \n`;
        row += "- [ ] dim_type \n";
        row += "\n";
      }
    });

    measures.forEach(measure => {
      row += `### MEASURE: ${measure.name} \n`;
      row += "\n";

      if (
        RegExp("confidence limit", "i").test(measure.name) || 
        RegExp("confidence interval", "i").test(measure.name) || 
        RegExp("moe", "i").test(measure.name)
      ) {
        if (!measure.annotations.error_for_measure) {
          row += "- [ ] error_for_measure \n";
        }
        if (!measure.annotations.error_type) {
          row += "- [ ] error_type \n";
        } 
      } 
      else {
        if (!measure.annotations.units_of_measurement) {
          row += "- [ ] units_of_measurement \n";
        }
      }

      row += "\n";

    });

    row += "----\n";
    row += "\n";
  });

  fs.writeFile("./scripts/cubes-audit.md", row, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/cubes-audit.md");
  });
});
